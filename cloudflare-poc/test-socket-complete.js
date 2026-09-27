import { io } from "../client/node_modules/socket.io-client/build/esm/index.js";
import fs from "node:fs";

// Load JWT_SECRET from ../server/.env safely in memory to generate a test token
const serverEnv = fs.readFileSync("../server/.env", "utf8");
let jwtSecret = "";
for (const line of serverEnv.split("\n")) {
  if (line.startsWith("JWT_SECRET=")) {
    jwtSecret = line.slice(line.indexOf("=") + 1).trim();
    break;
  }
}

const { default: jwt } = await import("../server/node_modules/jsonwebtoken/index.js");

// Generate in-memory token for authorized socket handshake test
const testToken = jwt.sign(
  {
    userId: "67e262949242443212378cb1",
    role: "student",
    name: "Socket Test Student",
    email: "socket-test@student.edu",
  },
  jwtSecret,
  { expiresIn: "1h" }
);

function testSocketConnection(targetUrl, label, options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = io(targetUrl, {
      reconnection: false,
      timeout: 5000,
      ...options,
    });

    let connected = false;
    let initialTransport = null;
    let upgradedTransport = null;

    socket.on("connect", () => {
      connected = true;
      const durationMs = Date.now() - start;
      initialTransport = socket.io.engine.transport.name;

      socket.io.engine.on("upgrade", (t) => {
        upgradedTransport = t.name;
      });

      // Disconnect cleanly after a short pause
      setTimeout(() => {
        socket.disconnect();
      }, 300);
    });

    socket.on("disconnect", (reason) => {
      const finalTransport = upgradedTransport || initialTransport;
      resolve({
        label,
        targetUrl,
        success: connected,
        durationMs: Date.now() - start,
        initialTransport,
        finalTransport,
        disconnectReason: reason,
      });
    });

    socket.on("connect_error", (err) => {
      resolve({
        label,
        targetUrl,
        success: false,
        durationMs: Date.now() - start,
        error: err.message,
      });
    });
  });
}

async function run() {
  console.log("===============================================================");
  console.log("EduMatrix Socket.IO & WebSocket Proxy Validation Suite");
  console.log("===============================================================\n");

  // 1. Direct Express Connection Baseline (Control)
  console.log("1. Testing Direct Express Baseline (http://127.0.0.1:5000)...");
  const directBaseline = await testSocketConnection(
    "http://127.0.0.1:5000",
    "Direct Express Baseline",
    { transports: ["websocket"] }
  );
  console.log("   Result:", directBaseline);

  // 2. Cloudflare Worker Proxy: Pure WebSocket Mode
  console.log("\n2. Testing Cloudflare Worker Proxy (Pure WebSocket Mode)...");
  const workerWs = await testSocketConnection(
    "http://127.0.0.1:8787",
    "Worker Pure WebSocket",
    { transports: ["websocket"] }
  );
  console.log("   Result:", workerWs);

  // 3. Cloudflare Worker Proxy: Pure Polling Mode
  console.log("\n3. Testing Cloudflare Worker Proxy (Pure HTTP Long-Polling)...");
  const workerPolling = await testSocketConnection(
    "http://127.0.0.1:8787",
    "Worker Pure Polling",
    { transports: ["polling"] }
  );
  console.log("   Result:", workerPolling);

  // 4. Cloudflare Worker Proxy: Default Negotiated Transport (Polling -> Upgrade WebSocket)
  console.log("\n4. Testing Cloudflare Worker Proxy (Default Negotiated Transport)...");
  const workerNegotiated = await testSocketConnection(
    "http://127.0.0.1:8787",
    "Worker Default Negotiated",
    { transports: ["polling", "websocket"] }
  );
  console.log("   Result:", workerNegotiated);

  // 5. Cloudflare Worker Proxy: Authenticated Handshake via auth: { token }
  console.log("\n5. Testing Cloudflare Worker Proxy with Authenticated Handshake...");
  const workerAuth = await testSocketConnection(
    "http://127.0.0.1:8787",
    "Worker Authenticated Handshake",
    {
      transports: ["websocket"],
      auth: { token: testToken },
      query: { token: testToken },
    }
  );
  console.log("   Result:", workerAuth);

  console.log("\n===============================================================");
  console.log("SOCKET.IO VALIDATION SUMMARY:");
  console.log(`1. Direct Express Baseline:      ${directBaseline.success ? "PASSED (websocket)" : "FAILED"}`);
  console.log(`2. Worker Pure WebSocket:        ${workerWs.success ? "PASSED (websocket)" : "FAILED"}`);
  console.log(`3. Worker Pure Polling:          ${workerPolling.success ? "PASSED (polling)" : "FAILED"}`);
  console.log(`4. Worker Negotiated Transport:  ${workerNegotiated.success ? "PASSED (" + workerNegotiated.finalTransport + ")" : "FAILED"}`);
  console.log(`5. Worker Authenticated Session: ${workerAuth.success ? "PASSED (websocket, authenticated)" : "FAILED"}`);
  console.log("===============================================================");
}

run().catch(console.error);
