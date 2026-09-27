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
import mongoosePkg from "mongoose/index.js";

const mongoose = mongoosePkg.default || mongoosePkg;

// Module-level connection singletons for warm-isolate reuse
let cachedMongoClient = null;
let mongoClientConnectCount = 0;

let cachedMongoose = null;
let mongooseConnectCount = 0;

/**
 * Redacts credentials from error messages and URIs
 */
function sanitizeError(msg) {
  if (!msg || typeof msg !== "string") return "Unknown error";
  return msg.replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, "mongodb+srv://[REDACTED_CREDENTIALS]@");
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

    // 1. Health-check route
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          runtime: "cloudflare-workers",
          compatibilityFlags: ["nodejs_compat_v2"],
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor(performance.now() / 1000),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    // 4. Outbound TLS TCP Socket Diagnostic
    if (url.pathname === "/test-socket") {
      const host = url.searchParams.get("host") || "cluster0-shard-00-00.mkcqp.mongodb.net";
      const port = Number(url.searchParams.get("port")) || 27017;
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
            error: cfErr.message,
            durationMs: Date.now() - start,
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Diagnostic: Direct Single-Node Connection with Full Event Capture
    if (url.pathname === "/test-single-node") {
      const overallStart = Date.now();
      const targetUri = env.MONGO_SINGLE_NODE_URI || env.MONGO_DIRECT_URI;
      const events = [];

      const clientOptions = {
        directConnection: true,
        tls: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      };

      const recordEvent = (type, data) => {
        events.push({
          elapsedMs: Date.now() - overallStart,
          type,
          ...JSON.parse(sanitizeError(JSON.stringify(data))),
        });
      };

      let client = null;
      try {
        client = new MongoClient(targetUri, clientOptions);

        client.on("serverOpening", (e) => recordEvent("serverOpening", { address: e.address }));
        client.on("serverClosed", (e) => recordEvent("serverClosed", { address: e.address }));
        client.on("serverDescriptionChanged", (e) =>
          recordEvent("serverDescriptionChanged", {
            address: e.address,
            previousType: e.previousDescription.type,
            newType: e.newDescription.type,
            error: e.newDescription.error ? e.newDescription.error.message : null,
          })
        );
        client.on("serverHeartbeatStarted", (e) =>
          recordEvent("serverHeartbeatStarted", { connectionId: e.connectionId })
        );
        client.on("serverHeartbeatSucceeded", (e) =>
          recordEvent("serverHeartbeatSucceeded", {
            connectionId: e.connectionId,
            duration: e.duration,
          })
        );
        client.on("serverHeartbeatFailed", (e) =>
          recordEvent("serverHeartbeatFailed", {
            connectionId: e.connectionId,
            duration: e.duration,
            failure: e.failure ? e.failure.message : null,
            stack: e.failure ? e.failure.stack : null,
          })
        );
        client.on("connectionCreated", (e) =>
          recordEvent("connectionCreated", { connectionId: e.connectionId, address: e.address })
        );
        client.on("connectionReady", (e) =>
          recordEvent("connectionReady", { connectionId: e.connectionId, address: e.address })
        );
        client.on("connectionClosed", (e) =>
          recordEvent("connectionClosed", { connectionId: e.connectionId, reason: e.reason })
        );
        client.on("commandStarted", (e) =>
          recordEvent("commandStarted", { commandName: e.commandName, databaseName: e.databaseName })
        );
        client.on("commandSucceeded", (e) =>
          recordEvent("commandSucceeded", { commandName: e.commandName, duration: e.duration })
        );
        client.on("commandFailed", (e) =>
          recordEvent("commandFailed", { commandName: e.commandName, failure: e.failure?.message })
        );

        await client.connect();
        const connectDurationMs = Date.now() - overallStart;

        const pingStart = Date.now();
        const pingRes = await client.db("admin").command({ ping: 1 });
        const pingDurationMs = Date.now() - pingStart;

        await client.close();

        return new Response(
          JSON.stringify({
            success: true,
            environment: "cloudflare-workers",
            connectDurationMs,
            pingDurationMs,
            pingResponse: pingRes,
            clientOptions,
            events,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        if (client) {
          try {
            await client.close();
          } catch (_) {}
        }

        return new Response(
          JSON.stringify({
            success: false,
            environment: "cloudflare-workers",
            totalDurationMs: Date.now() - overallStart,
            errorName: err.name,
            errorMessage: sanitizeError(err.message),
            errorCause: err.cause ? sanitizeError(err.cause.message || JSON.stringify(err.cause)) : null,
            clientOptions,
            events,
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
