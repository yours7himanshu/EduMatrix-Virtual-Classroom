import { MongoClient } from "mongodb";
import fs from "node:fs";

function sanitize(str) {
  if (typeof str !== "string") str = JSON.stringify(str);
  return str.replace(/\/\/[^:]+:[^@]+@/g, "//<REDACTED_AUTH>@");
}

// Read from .dev.vars
const devVars = fs.readFileSync(".dev.vars", "utf8");
let singleNodeUri = "";
for (const line of devVars.split("\n")) {
  if (line.startsWith("MONGO_SINGLE_NODE_URI=")) {
    singleNodeUri = line.slice(line.indexOf("=") + 1).trim();
    break;
  }
}

if (!singleNodeUri) {
  console.error("Missing MONGO_SINGLE_NODE_URI");
  process.exit(1);
}

const clientOptions = {
  directConnection: true,
  tls: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

console.log("=== Node.js Diagnostic: Single-Node Direct Connection ===");
console.log("Resolved mongodb version:", JSON.parse(fs.readFileSync("./node_modules/mongodb/package.json")).version);
console.log("Connection options:", JSON.stringify(clientOptions, null, 2));
console.log("Target URI (sanitized):", sanitize(singleNodeUri));

const events = [];
function recordEvent(type, data) {
  const ts = new Date().toISOString();
  const entry = { ts, type, ...data };
  events.push(entry);
  console.log(`[EVENT ${type}]`, sanitize(JSON.stringify(data)));
}

const client = new MongoClient(singleNodeUri, clientOptions);

// SDAM & Connection Pool Event Listeners
client.on("serverOpening", (e) => recordEvent("serverOpening", { address: e.address }));
client.on("serverClosed", (e) => recordEvent("serverClosed", { address: e.address }));
client.on("serverDescriptionChanged", (e) => recordEvent("serverDescriptionChanged", {
  address: e.address,
  previousType: e.previousDescription.type,
  newType: e.newDescription.type,
  error: e.newDescription.error ? e.newDescription.error.message : null,
}));
client.on("serverHeartbeatStarted", (e) => recordEvent("serverHeartbeatStarted", { connectionId: e.connectionId }));
client.on("serverHeartbeatSucceeded", (e) => recordEvent("serverHeartbeatSucceeded", {
  connectionId: e.connectionId,
  duration: e.duration,
}));
client.on("serverHeartbeatFailed", (e) => recordEvent("serverHeartbeatFailed", {
  connectionId: e.connectionId,
  duration: e.duration,
  failure: e.failure ? e.failure.message : null,
  stack: e.failure ? e.failure.stack : null,
}));
client.on("connectionCreated", (e) => recordEvent("connectionCreated", { connectionId: e.connectionId, address: e.address }));
client.on("connectionReady", (e) => recordEvent("connectionReady", { connectionId: e.connectionId, address: e.address }));
client.on("connectionClosed", (e) => recordEvent("connectionClosed", { connectionId: e.connectionId, reason: e.reason }));
client.on("commandStarted", (e) => recordEvent("commandStarted", { commandName: e.commandName, databaseName: e.databaseName }));
client.on("commandSucceeded", (e) => recordEvent("commandSucceeded", { commandName: e.commandName, duration: e.duration }));
client.on("commandFailed", (e) => recordEvent("commandFailed", { commandName: e.commandName, failure: e.failure?.message }));

async function run() {
  const startTime = Date.now();
  try {
    console.log("Calling client.connect()...");
    await client.connect();
    const connectDurationMs = Date.now() - startTime;
    console.log(`Connected successfully in ${connectDurationMs}ms!`);

    console.log("Sending admin ping command...");
    const pingStart = Date.now();
    const pingRes = await client.db("admin").command({ ping: 1 });
    const pingDurationMs = Date.now() - pingStart;
    console.log("Ping response:", pingRes, `(took ${pingDurationMs}ms)`);

    await client.close();
    console.log("Client closed cleanly.");
    console.log("\nNode.js Diagnostic Result: SUCCESS");
  } catch (err) {
    const totalDurationMs = Date.now() - startTime;
    console.error(`\nNode.js Diagnostic Result: FAILED in ${totalDurationMs}ms`);
    console.error("Error Name:", err.name);
    console.error("Error Message:", sanitize(err.message));
    if (err.cause) {
      console.error("Error Cause:", sanitize(err.cause.message || JSON.stringify(err.cause)));
    }
  }
}

run();
