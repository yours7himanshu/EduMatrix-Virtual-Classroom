/*
 * EduMatrix Database Manager (Phase 5: Database Adaptation)
 * 
 * Serverless-compatible Mongoose connection manager with connection-promise caching,
 * readyState reuse, timeout controls, and credential sanitization.
 * Supports Node.js Express daemon and Cloudflare Workers execution models.
 *
 * Workers runtime note (verified 2026-09-28 in real workerd against Atlas):
 * the official driver connects and handshakes correctly when the Worker is
 * built with current tooling (Wrangler 4.x; repo pins ^4.142.0). Older
 * Wrangler 3.x builds stalled every TLS handshake at the 5s selection
 * timeout, and bumping compatibility_date alone did not help. Two further
 * constraints apply in plain Workers: (1) every Mongoose import must resolve
 * to a SINGLE shared instance (bare "mongoose" via the wrangler alias — see
 * below), otherwise models strand on a connection this module never opens;
 * (2) sockets cannot be reused across requests ("Cannot perform I/O on
 * behalf of a different request"), so database work must connect fresh
 * inside the requesting context — see withRequestDb below. There is no
 * cross-request connection pooling in plain Workers by design.
 */

let mongoosePkg;
try {
  // Single-funnel resolution: bare "mongoose" goes through the wrangler
  // alias to src/mongoose-edge.js — the same module every model, controller,
  // and service resolves. Subpath imports (e.g. "mongoose/index.js") can
  // evaluate as a SECOND instance inside the Worker bundle, leaving models
  // stranded on a connection this module never opens (observed: default
  // connection readyState 1 here while model operations buffered forever).
  mongoosePkg = require('mongoose');
} catch (_) {
  mongoosePkg = require('mongoose/index.js');
}
const mongoose = mongoosePkg.default || mongoosePkg;

// Module-level connection promise for concurrency coalescing & warm-isolate reuse
let connectionPromise = null;

// ---- Phase 8: bounded serverless connection lifecycle ----

// Minimum interval between outbound MongoDB connection attempts after a
// failure. Prevents a retry storm (e.g. high-frequency polling requests)
// while still allowing prompt recovery once the cooldown expires.
const FAILURE_COOLDOWN_MS = 5000;
let lastFailureAt = 0;

/**
 * Resolves the intended connection mode from Worker bindings or process env.
 * - "direct": use a non-SRV direct connection URI (MONGO_DIRECT_URI).
 * - anything else ("srv" default): use the standard URI (MONGO_URI).
 * Controlled by the MONGO_CONNECTION_MODE binding; defaults to "srv" so
 * existing deployments keep their current behavior until the operator opts in.
 */
function resolveConnectionMode(env) {
  const fromEnv = env && typeof env.MONGO_CONNECTION_MODE === 'string' ? env.MONGO_CONNECTION_MODE.trim().toLowerCase() : '';
  const fromProcess = typeof process !== 'undefined' && process.env && typeof process.env.MONGO_CONNECTION_MODE === 'string'
    ? process.env.MONGO_CONNECTION_MODE.trim().toLowerCase() : '';
  const mode = fromEnv || fromProcess || 'srv';
  return mode === 'direct' ? 'direct' : 'srv';
}

/**
 * Resolves which binding supplies the target URI for a mode, without
 * exposing the value. Returns { uri, kind } where kind identifies the
 * binding name ("MONGO_URI" | "MONGO_DIRECT_URI") or null when unconfigured.
 */
function resolveTargetUri(env, mode) {
  const read = (key) => {
    if (env && typeof env[key] === 'string' && env[key].trim()) return env[key];
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string' && process.env[key].trim()) {
      return process.env[key];
    }
    return null;
  };
  if (mode === 'direct') {
    const direct = read('MONGO_DIRECT_URI');
    if (direct) return { uri: direct, kind: 'MONGO_DIRECT_URI' };
    return { uri: null, kind: null };
  }
  // Default ("srv") mode mirrors the historical resolution order used by
  // connectDB: MONGO_URI first, MONGO_DIRECT_URI as fallback.
  const srv = read('MONGO_URI');
  if (srv) return { uri: srv, kind: 'MONGO_URI' };
  const fallbackDirect = read('MONGO_DIRECT_URI');
  if (fallbackDirect) return { uri: fallbackDirect, kind: 'MONGO_DIRECT_URI' };
  return { uri: null, kind: null };
}

/**
 * Classifies a sanitized database error into a coarse, non-sensitive
 * category for logs and readiness responses. Input must already be
 * sanitized; output never contains connection details.
 */
function classifyDbError(sanitizedMessage) {
  const text = String(sanitizedMessage || '');
  if (/MONGO_URI is not set|not configured/i.test(text)) return 'missing-uri';
  if (/authentication failed|bad auth|auth failed|bad auth/i.test(text)) return 'authentication';
  if (/ENOTFOUND|getaddrinfo|SRV|dns/i.test(text)) return 'dns';
  if (/TLS|SSL|certificate/i.test(text)) return 'tls';
  if (/server selection|timed out|topology|buffering timed out|ECONNREFUSED|connect ETIMEDOUT|network|no servers|whitelist/i.test(text)) {
    return 'server-selection-timeout';
  }
  return 'unknown';
}

/**
 * Extracts only the error NAME (and numeric code, when present) of each
 * distinct per-server failure behind a MongoServerSelectionError. Never
 * includes messages, hosts, ports, credentials, or any other values — safe
 * for server logs. Returns e.g. ["MongoNetworkTimeoutError"] or [].
 */
function describeSelectionCauses(error) {
  try {
    const descriptions = error && error.reason && error.reason.serverDescriptions;
    if (!descriptions) return [];
    const values = typeof descriptions.values === 'function'
      ? Array.from(descriptions.values())
      : Object.values(descriptions);
    const names = new Set();
    for (const desc of values) {
      const cause = desc && desc.error;
      if (cause && typeof cause.name === 'string') {
        names.add(typeof cause.code !== 'undefined' && cause.code !== null
          ? `${cause.name}#${cause.code}`
          : cause.name);
      }
    }
    return Array.from(names).slice(0, 5);
  } catch {
    return [];
  }
}

/**
 * Reports the current isolate database state without initiating a new
 * connection and without exposing any URI value.
 */
function getDbStatus(env, mode) {
  const resolvedMode = mode === 'direct' || mode === 'srv' ? mode : resolveConnectionMode(env);
  const { kind } = resolveTargetUri(env, resolvedMode);
  return {
    connected: isDbConnected(),
    state: getConnectionState(),
    mode: resolvedMode,
    uriKind: kind,
    failureCooldownActive: Boolean(lastFailureAt && Date.now() - lastFailureAt < FAILURE_COOLDOWN_MS),
  };
}

/**
 * Ensures a live database connection, bounded for serverless isolates.
 * - Reuses the warm-isolate connection when already connected.
 * - Coalesces concurrent attempts onto the in-flight promise (via connectDB).
 * - Fails fast with HTTP 503 when a previous attempt failed within the
 *   cooldown window, or when no URI binding is configured.
 * - Never returns a null/disconnected handle: callers can rely on a live
 *   connection or a catchable 503 error (never a silent buffering hang).
 */
const ensureDbConnected = async (options) => {
  if (isDbConnected()) {
    lastFailureAt = 0;
    return mongoose;
  }
  const opts = options && typeof options === 'object' ? options : {};
  const now = Date.now();
  if (lastFailureAt && now - lastFailureAt < FAILURE_COOLDOWN_MS) {
    const cooldownErr = new Error('Database unavailable: connection failed recently, retry shortly');
    cooldownErr.status = 503;
    cooldownErr.code = 'DB_UNAVAILABLE';
    cooldownErr.category = 'recent-failure';
    throw cooldownErr;
  }
  const mode = opts.mode === 'direct' || opts.mode === 'srv' ? opts.mode : resolveConnectionMode(opts.env);
  const { uri } = resolveTargetUri(opts.env, mode);
  if (!uri) {
    lastFailureAt = now;
    console.error('Database unavailable: no MongoDB URI configured (expected MONGO_URI or MONGO_DIRECT_URI binding)');
    const configErr = new Error('Database unavailable: service is not configured');
    configErr.status = 503;
    configErr.code = 'DB_NOT_CONFIGURED';
    configErr.category = 'missing-uri';
    throw configErr;
  }
  try {
    const result = await connectDB({ env: opts.env, mode });
    if (!result || !isDbConnected()) {
      throw new Error('Database connection did not reach a connected state');
    }
    lastFailureAt = 0;
    return result;
  } catch (error) {
    lastFailureAt = Date.now();
    if (error && (error.status === 503 || error.code === 'DB_NOT_CONFIGURED' || error.code === 'DB_UNAVAILABLE')) {
      throw error;
    }
    const sanitized = sanitizeMongoUri(error.message || String(error));
    const category = classifyDbError(sanitized);
    const causes = describeSelectionCauses(error);
    console.error(
      `Database unavailable [${category}]:`,
      causes.length ? `${sanitized} (causes: ${causes.join(', ')})` : sanitized
    );
    const unavailableErr = new Error('Database unavailable: unable to reach the database. Please try again shortly.');
    unavailableErr.status = 503;
    unavailableErr.code = 'DB_UNAVAILABLE';
    unavailableErr.category = category;
    throw unavailableErr;
  }
};

/**
 * Clears the failure-cooldown marker (used by tests and controlled recovery).
 * Does not touch live connections.
 */
function resetDbFailureState() {
  lastFailureAt = 0;
}

// ---- Phase 9: request-scoped connections for Workers isolates ----
//
// Cloudflare Workers forbids using I/O objects (sockets, streams) created
// during one request from a different request ("Cannot perform I/O on behalf
// of a different request" — the isolate cancels such requests as hung).
// A cached Mongoose connection therefore goes stale the moment its creating
// request finishes. Verified: /ready connects (200), the very next request
// reusing that connection is canceled in ~50ms with no error ever thrown.
//
// Consequently, database work in plain Workers must connect fresh inside the
// requesting context and never rely on cross-request socket reuse. This
// helper serializes data-request database use per isolate (at most one
// request holds the connection), always starts from a disconnected state so
// the connection is created in the caller's own I/O context, runs `fn`, then
// disconnects before releasing. Concurrent data requests fail fast with 503
// ("busy") instead of corrupting each other's I/O. Non-data routes
// (health, preflight, realtime handshakes) bypass this entirely.
let dbRequestInUse = false;

async function disconnectQuietly() {
  try {
    await disconnectDB();
  } catch (_) {
    // Best-effort teardown only; errors are already logged at their source.
  }
}

const withRequestDb = async (options, fn) => {
  if (dbRequestInUse) {
    const busyErr = new Error('Database busy: another request is using the connection slot, retry shortly');
    busyErr.status = 503;
    busyErr.code = 'DB_BUSY';
    busyErr.category = 'contention';
    throw busyErr;
  }
  dbRequestInUse = true;
  try {
    // Drop any connection created by a previous request: its sockets belong
    // to a finished I/O context and can never be used again.
    await disconnectQuietly();
    // NOTE: property lookup (not the local binding) so tests and operators
    // can substitute the acquisition step without touching this discipline.
    await connectDB.ensureDbConnected(options);
    return await fn();
  } finally {
    // Never leak sockets across requests; the next holder reconnects fresh.
    await disconnectQuietly();
    dbRequestInUse = false;
  }
};

/** Test hook: reports whether the request slot is currently held. */
function isDbRequestInUse() {
  return dbRequestInUse;
}

/**
 * Redacts database credentials from connection strings, URLs, and error messages.
 */
function sanitizeMongoUri(str) {
  if (!str) return '';
  const text = typeof str === 'string' ? str : (str.message || String(str));
  return text.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, (match, srv) => `mongodb${srv || ''}://[REDACTED_CREDENTIALS]@`);
}

/**
 * Returns true if Mongoose has an active, connected database state (readyState === 1).
 */
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Returns the human-readable connection state name.
 */
function getConnectionState() {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const state = mongoose.connection ? mongoose.connection.readyState : 0;
  return states[state] || 'unknown';
}

/**
 * Cleanly disconnects and resets the connection promise.
 */
async function disconnectDB() {
  if (connectionPromise) {
    try {
      await connectionPromise;
    } catch (_) {}
  }
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}

/**
 * Connects to MongoDB with connection reuse, serverless pooling, and concurrency safety.
 *
 * @param {string|Object} [uriOrOptions] - Optional URI string, options object, or Express req
 * @param {Object} [res] - Optional Express res object (for backwards compatibility)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = (uriOrOptions, res) => {
  // 1. Check if already connected (warm isolate / existing connection)
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  // 2. Coalesce concurrent connection attempts onto the in-flight promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // 3. Resolve target URI from argument, Worker environment bindings, or process.env
  let targetUri;
  if (typeof uriOrOptions === 'string') {
    targetUri = uriOrOptions;
  } else if (uriOrOptions && typeof uriOrOptions === 'object') {
    if (uriOrOptions.uri) {
      targetUri = uriOrOptions.uri;
    } else if (uriOrOptions.env) {
      if (uriOrOptions.mode === 'direct' && uriOrOptions.env.MONGO_DIRECT_URI) {
        targetUri = uriOrOptions.env.MONGO_DIRECT_URI;
      } else {
        targetUri = uriOrOptions.env.MONGO_URI || uriOrOptions.env.MONGO_DIRECT_URI;
      }
    }
  }

  if (!targetUri && typeof process !== 'undefined' && process.env) {
    targetUri = process.env.MONGO_URI || process.env.MONGO_DIRECT_URI;
  }

  if (!targetUri) {
    console.warn('⚠️ Warning: MONGO_URI is not set in environment variables');
    return Promise.resolve(null);
  }

  // 4. Serverless-optimized connection options
  const clientOptions = {
    bufferCommands: false, // Fail fast rather than hang when disconnected
    maxPoolSize: 1, // Single connection per isolate to prevent socket exhaustion
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    // Force IPv4 for outbound connections. Atlas IP access lists are commonly
    // IPv4-only (e.g. 0.0.0.0/0), while edge runtimes may otherwise attempt
    // IPv6 first and stall on server selection. Harmless when already IPv4.
    family: 4,
  };

  // 5. Initiate connection and cache the promise to prevent stampedes
  connectionPromise = (async () => {
    try {
      await mongoose.connect(targetUri, clientOptions);
      console.log('Database successfully connected');
      return mongoose;
    } catch (error) {
      // Reset cached promise on failure so subsequent requests can retry
      connectionPromise = null;
      const sanitized = sanitizeMongoUri(error.message || String(error));
      const causes = describeSelectionCauses(error);
      console.error(
        'Error connecting to the Database:',
        causes.length ? `${sanitized} (causes: ${causes.join(', ')})` : sanitized
      );

      // Backwards compatibility with Express middleware call signatures
      if (res && typeof res.status === 'function') {
        res.status(500).json({
          success: false,
          error: 'Error connecting to the database',
        });
      }
      const safeError = new Error(sanitized);
      safeError.name = error.name || 'MongoError';
      throw safeError;
    }
  })();

  return connectionPromise;
};

connectDB.isDbConnected = isDbConnected;
connectDB.getConnectionState = getConnectionState;
connectDB.disconnectDB = disconnectDB;
connectDB.sanitizeMongoUri = sanitizeMongoUri;
connectDB.mongoose = mongoose;
connectDB.resolveConnectionMode = resolveConnectionMode;
connectDB.resolveTargetUri = resolveTargetUri;
connectDB.classifyDbError = classifyDbError;
connectDB.describeSelectionCauses = describeSelectionCauses;
connectDB.getDbStatus = getDbStatus;
connectDB.ensureDbConnected = ensureDbConnected;
connectDB.resetDbFailureState = resetDbFailureState;
connectDB.withRequestDb = withRequestDb;
connectDB.isDbRequestInUse = isDbRequestInUse;
connectDB.FAILURE_COOLDOWN_MS = FAILURE_COOLDOWN_MS;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isDbConnected = isDbConnected;
module.exports.getConnectionState = getConnectionState;
module.exports.disconnectDB = disconnectDB;
module.exports.sanitizeMongoUri = sanitizeMongoUri;
module.exports.mongoose = mongoose;
module.exports.resolveConnectionMode = resolveConnectionMode;
module.exports.resolveTargetUri = resolveTargetUri;
module.exports.classifyDbError = classifyDbError;
module.exports.describeSelectionCauses = describeSelectionCauses;
module.exports.getDbStatus = getDbStatus;
module.exports.ensureDbConnected = ensureDbConnected;
module.exports.resetDbFailureState = resetDbFailureState;
module.exports.withRequestDb = withRequestDb;
module.exports.isDbRequestInUse = isDbRequestInUse;

