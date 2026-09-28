/*
 * EduMatrix Database Manager (Phase 5: Database Adaptation)
 * 
 * Serverless-compatible Mongoose connection manager with connection-promise caching,
 * readyState reuse, timeout controls, and credential sanitization.
 * Supports Node.js Express daemon and Cloudflare Workers execution models.
 */

let mongoosePkg;
try {
  mongoosePkg = require('mongoose/index.js');
} catch (_) {
  mongoosePkg = require('mongoose');
}
const mongoose = mongoosePkg.default || mongoosePkg;

// Module-level connection promise for concurrency coalescing & warm-isolate reuse
let connectionPromise = null;

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
      console.error('Error connecting to the Database:', sanitized);

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

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.isDbConnected = isDbConnected;
module.exports.getConnectionState = getConnectionState;
module.exports.disconnectDB = disconnectDB;
module.exports.sanitizeMongoUri = sanitizeMongoUri;
module.exports.mongoose = mongoose;

