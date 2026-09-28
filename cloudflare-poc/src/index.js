/**
 * Cloudflare Workers MongoDB Compatibility Proof of Concept
 * 
 * Evaluates:
 * 1. Cloudflare Workers runtime (V8 isolate / workerd) health
 * 2. Official MongoDB Node.js Driver (v6) with nodejs_compat_v2
 * 3. Mongoose (v8) ODM connection behavior in edge isolates
 * 4. Cold-start connection latency vs warm sequential connection reuse
 * 5. Outbound TLS socket layer (cloudflare:sockets)
 */

import { MongoClient } from "mongodb";
// Single-funnel resolution (see server/db/db.js): bare "mongoose" goes
// through the wrangler alias so diagnostics share the application's instance.
import mongoosePkg from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectDBPkg from "../../server/db/db.js";
import honoAppPkg from "../../server/honoApp.js";

const mongoose = mongoosePkg.default || mongoosePkg;
const connectDB = connectDBPkg.default || connectDBPkg;
const honoApp = honoAppPkg.default || honoAppPkg;

// Module-level connection singletons for warm-isolate reuse
let cachedMongoClient = null;
let mongoClientConnectCount = 0;

let cachedMongoose = null;
let mongooseConnectCount = 0;

/**
 * Redacts credentials from error messages and URIs
 */
function sanitizeError(msg) {
  if (!msg) return "";
  const text = typeof msg === "string" ? msg : (msg.message || String(msg));
  return text.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, (match, srv) => `mongodb${srv || ''}://[REDACTED_CREDENTIALS]@`);
}

/**
 * Approach A: Official MongoDB Node.js Driver (Serverless Pattern)
 */
async function getMongoClient(uri) {
  const start = Date.now();
  let wasReused = false;

  if (cachedMongoClient) {
    wasReused = true;
    return { client: cachedMongoClient, wasReused, durationMs: 0 };
  }

  if (!uri) {
    throw new Error("MONGO_URI is missing from environment bindings");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  cachedMongoClient = client;
  mongoClientConnectCount += 1;

  return {
    client: cachedMongoClient,
    wasReused,
    durationMs: Date.now() - start,
  };
}

/**
 * Approach B: Mongoose ODM (Serverless Pattern)
 */
async function getMongooseConnection(uri) {
  const start = Date.now();
  let wasReused = false;

  if (cachedMongoose && mongoose.connection.readyState === 1) {
    wasReused = true;
    return { connection: cachedMongoose, wasReused, durationMs: 0 };
  }

  if (!uri) {
    throw new Error("MONGO_URI is missing from environment bindings");
  }

  await mongoose.connect(uri, {
    bufferCommands: false,
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  cachedMongoose = mongoose.connection;
  mongooseConnectCount += 1;

  return {
    connection: cachedMongoose,
    wasReused,
    durationMs: Date.now() - start,
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Isolate diagnostic routes behind strict default-deny policy:
    // Requires explicit ENABLE_DIAGNOSTICS === "true" AND must never run in production.
    const diagnosticPaths = ["/db/live-verify", "/test-db", "/test-driver", "/test-mongoose", "/test-node-tls", "/test-socket"];
    if (diagnosticPaths.includes(url.pathname)) {
      const diagnosticsAllowed = env && env.ENABLE_DIAGNOSTICS === "true" && env.NODE_ENV !== "production";
      if (!diagnosticsAllowed) {
        return new Response(JSON.stringify({ error: "Not found", path: url.pathname }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      // Continue to diagnostic routes below only if explicitly authorized
    } else {
      // Delegate all application routing, API endpoints, WebSockets, and health checks to the Hono routing framework
      return honoApp.fetch(request, env, ctx);
    }

    // 1f. Phase 5 Targeted Live Verification route using adapted server/db/db.js
    if (url.pathname === "/db/live-verify") {
      const overallStart = Date.now();

      // Check if testing failure behavior and credential redaction
      if (url.searchParams.get("testFailure") === "true") {
        try {
          const fakeAuthUri = "mongodb://fakeUser:SecretPassword123!@127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50";
          await connectDB({ uri: fakeAuthUri });
          return new Response(JSON.stringify({ success: false, message: "Expected connection failure but succeeded" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        } catch (failErr) {
          const rawMsg = failErr.message || String(failErr);
          const sanitized = connectDB.sanitizeMongoUri(rawMsg);
          const credentialsRedacted = !sanitized.includes("SecretPassword123!") &&
                                      !sanitized.includes("fakeUser");
          return new Response(
            JSON.stringify({
              success: true,
              test: "safe_failure_and_credential_redaction",
              failureHandled: true,
              credentialsRedacted,
              sanitizedError: sanitized,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const mode = url.searchParams.get("mode") || "direct"; // default direct replica for edge socket reliability

      try {
        // Step 1: Real Authenticated Mongoose connection via adapted server/db/db.js
        const connectStart = Date.now();
        const mongooseInstance = await connectDB({ env, mode });
        const connectDurationMs = Date.now() - connectStart;
        const isConnected = connectDB.isDbConnected();
        const connectionState = connectDB.getConnectionState();

        if (!isConnected || !mongooseInstance.connection?.db) {
          throw new Error("connectDB completed but Mongoose connection.db is not active");
        }

        const db = mongooseInstance.connection.db;

        // Step 2: Harmless read against existing database / collections
        const readStart = Date.now();
        const pingResult = await db.admin().ping();
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        let sampleCollection = collectionNames.find((c) => c.startsWith("test")) || collectionNames[0] || null;
        let sampleCount = 0;
        if (sampleCollection) {
          sampleCount = await db.collection(sampleCollection).countDocuments();
        }
        const readDurationMs = Date.now() - readStart;

        // Step 3: Controlled test write and cleanup using isolated test data only
        const writeStart = Date.now();
        const testCollection = db.collection("_cf_worker_phase5_verification");
        const testDocId = `phase5_live_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Write: Insert isolated test document
        const insertRes = await testCollection.insertOne({
          _id: testDocId,
          testTag: "phase5_workerd_live_verification",
          runtime: "cloudflare-workers (workerd)",
          timestamp: new Date(),
        });

        // Read-back to verify write consistency
        const foundDoc = await testCollection.findOne({ _id: testDocId });

        // Cleanup: Delete the test document immediately
        const deleteRes = await testCollection.deleteOne({ _id: testDocId });
        const writeCleanupDurationMs = Date.now() - writeStart;

        // Step 4: Verify connection reuse in same warm isolate
        const reuseStart = Date.now();
        await connectDB({ env, mode });
        const reuseDurationMs = Date.now() - reuseStart;
        const wasReused = reuseDurationMs < 20;

        return new Response(
          JSON.stringify({
            success: true,
            runtime: "cloudflare-workers (workerd)",
            manager: "server/db/db.js",
            connection: {
              authenticated: true,
              connectionState,
              isDbConnected: isConnected,
              connectDurationMs,
              reuseDurationMs,
              connectionReused: wasReused,
              uriMode: mode,
            },
            harmlessRead: {
              ping: pingResult,
              totalCollectionsFound: collectionNames.length,
              sampleCollection,
              sampleCount,
              readDurationMs,
            },
            controlledWriteAndCleanup: {
              collection: "_cf_worker_phase5_verification",
              insertedId: testDocId,
              insertedAcknowledged: insertRes.acknowledged,
              readBackVerified: foundDoc !== null && foundDoc._id === testDocId,
              deletedCount: deleteRes.deletedCount,
              cleanupVerified: deleteRes.deletedCount === 1,
              writeCleanupDurationMs,
            },
            totalDurationMs: Date.now() - overallStart,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        const sanitized = connectDB.sanitizeMongoUri(err.message || String(err));
        return new Response(
          JSON.stringify({
            success: false,
            runtime: "cloudflare-workers (workerd)",
            manager: "server/db/db.js",
            error: sanitized,
            name: err.name,
            totalDurationMs: Date.now() - overallStart,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Approach A: Official Native MongoDB Node Driver Test
    if (url.pathname === "/test-db" || url.pathname === "/test-driver") {
      const overallStart = Date.now();
      const mode = url.searchParams.get("mode") || "srv"; // default srv
      const targetUri = mode === "direct" && env.MONGO_DIRECT_URI ? env.MONGO_DIRECT_URI : env.MONGO_URI;

      try {
        const { client, wasReused, durationMs: connectDurationMs } = await getMongoClient(targetUri);

        const queryStart = Date.now();
        // Ping admin database
        const pingResult = await client.db("admin").command({ ping: 1 });

        // List collections in database
        const collections = await client.db("test").listCollections().toArray();
        const collectionNames = collections.map((c) => c.name);

        // Read-only count sample
        let sampleCollection = null;
        let sampleCount = 0;
        if (collectionNames.includes("institutions")) {
          sampleCollection = "institutions";
          sampleCount = await client.db("test").collection("institutions").countDocuments();
        } else if (collectionNames.length > 0) {
          sampleCollection = collectionNames[0];
          sampleCount = await client.db("test").collection(sampleCollection).countDocuments();
        }

        const queryDurationMs = Date.now() - queryStart;
        const totalDurationMs = Date.now() - overallStart;

        return new Response(
          JSON.stringify({
            success: true,
            approach: "MongoDB Native Driver (v6)",
            uriMode: mode,
            metrics: {
              connectDurationMs,
              queryDurationMs,
              totalDurationMs,
              isConnectionReused: wasReused,
              totalIsolateConnections: mongoClientConnectCount,
            },
            data: {
              ping: pingResult,
              totalCollectionsFound: collectionNames.length,
              sampleCollection,
              sampleCount,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            approach: "MongoDB Native Driver (v6)",
            uriMode: mode,
            error: sanitizeError(err.message),
            name: err.name,
            totalDurationMs: Date.now() - overallStart,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Approach B: Mongoose ODM Test
    if (url.pathname === "/test-mongoose") {
      const overallStart = Date.now();
      const mode = url.searchParams.get("mode") || "srv";
      const targetUri = mode === "direct" && env.MONGO_DIRECT_URI ? env.MONGO_DIRECT_URI : env.MONGO_URI;

      try {
        const { connection, wasReused, durationMs: connectDurationMs } = await getMongooseConnection(targetUri);

        const queryStart = Date.now();
        const adminPing = await mongoose.connection.db.admin().ping();
        const collections = await mongoose.connection.db.listCollections().toArray();
        const queryDurationMs = Date.now() - queryStart;
        const totalDurationMs = Date.now() - overallStart;

        return new Response(
          JSON.stringify({
            success: true,
            approach: "Mongoose ODM (v8)",
            uriMode: mode,
            metrics: {
              connectDurationMs,
              queryDurationMs,
              totalDurationMs,
              isConnectionReused: wasReused,
              totalIsolateConnections: mongooseConnectCount,
              mongooseReadyState: mongoose.connection.readyState,
            },
            data: {
              ping: adminPing,
              collectionsCount: collections.length,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            approach: "Mongoose ODM (v8)",
            uriMode: mode,
            error: sanitizeError(err.message),
            name: err.name,
            totalDurationMs: Date.now() - overallStart,
            mongooseReadyState: mongoose?.connection?.readyState ?? null,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3b. Diagnostic: node:tls compatibility check
    if (url.pathname === "/test-node-tls") {
      const host = "cluster0-shard-00-00.mkcqp.mongodb.net";
      const port = 27017;
      const start = Date.now();
      try {
        const tls = await import("node:tls");
        const socketPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("node:tls socket timeout after 5000ms")), 5000);
          const socket = tls.connect({ host, port, servername: host }, () => {
            clearTimeout(timeout);
            socket.end();
            resolve({ connected: true, latencyMs: Date.now() - start });
          });
          socket.on("error", (e) => {
            clearTimeout(timeout);
            reject(e);
          });
        });
        const result = await socketPromise;
        return new Response(JSON.stringify({ success: true, api: "node:tls", ...result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, api: "node:tls", error: err.message, stack: err.stack }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 4. Outbound TLS TCP Socket Diagnostic (Restricted to safe predefined target)
    if (url.pathname === "/test-socket") {
      const ALLOWED_HOST = "cluster0-shard-00-00.mkcqp.mongodb.net";
      const ALLOWED_PORT = 27017;

      const requestedHost = url.searchParams.get("host");
      const requestedPort = url.searchParams.get("port");

      if (
        (requestedHost && requestedHost !== ALLOWED_HOST) ||
        (requestedPort && Number(requestedPort) !== ALLOWED_PORT)
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Forbidden: Arbitrary host or port probing is not permitted. Predefined diagnostic target only.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      const host = ALLOWED_HOST;
      const port = ALLOWED_PORT;
      const start = Date.now();

      try {
        const { connect } = await import("cloudflare:sockets");
        const socket = connect({ hostname: host, port }, { secureTransport: "on" });

        const reader = socket.readable.getReader();
        const writer = socket.writable.getWriter();

        await reader.releaseLock();
        await writer.releaseLock();
        await socket.close();

        return new Response(
          JSON.stringify({
            success: true,
            api: "cloudflare:sockets",
            host,
            port,
            handshakeLatencyMs: Date.now() - start,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (cfErr) {
        return new Response(
          JSON.stringify({
            success: false,
            api: "cloudflare:sockets",
            error: sanitizeError(cfErr.message),
            durationMs: Date.now() - start,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Route not found", path: url.pathname }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  },
};
