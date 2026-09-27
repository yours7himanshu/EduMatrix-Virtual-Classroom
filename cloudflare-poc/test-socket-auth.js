import { io } from "../client/node_modules/socket.io-client/build/esm/index.js";
import fs from "node:fs";

// Load JWT_SECRET from ../server/.env safely in memory
const serverEnv = fs.readFileSync("../server/.env", "utf8");
let jwtSecret = "";
for (const line of serverEnv.split("\n")) {
  if (line.startsWith("JWT_SECRET=")) {
    jwtSecret = line.slice(line.indexOf("=") + 1).trim();
    break;
  }
}

const { default: jwt } = await import("../server/node_modules/jsonwebtoken/index.js");

// Valid test token (short-lived)
const validToken = jwt.sign(
  {
    userId: "67e262949242443212378cb1",
    role: "student",
    name: "Socket Auth Tester",
    email: "auth-test@student.edu",
  },
  jwtSecret,
  { expiresIn: "10m" }
);

// Expired test token (expired 2 hours ago)
const expiredToken = jwt.sign(
  {
    userId: "67e262949242443212378cb1",
    role: "student",
    name: "Expired Tester",
  },
  jwtSecret,
  { expiresIn: "-2h" }
);

// Completely invalid signature token
const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature123";

function testSocketAuth(targetUrl, label, authPayload) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = io(targetUrl, {
      reconnection: false,
      timeout: 4000,
      transports: ["websocket"],
      auth: authPayload,
      query: authPayload,
    });

    let connected = false;
    let transportName = null;

    socket.on("connect", () => {
      connected = true;
      transportName = socket.io.engine.transport.name;
      const durationMs = Date.now() - start;

      // Disconnect cleanly after 300ms
      setTimeout(() => {
        socket.disconnect();
      }, 300);
    });

    socket.on("disconnect", (reason) => {
      resolve({
        label,
        targetUrl,
        connected,
        durationMs: Date.now() - start,
        transport: transportName,
        disconnectReason: reason,
        rejectedAtHandshake: false,
      });
    });

    socket.on("connect_error", (err) => {
      resolve({
        label,
        targetUrl,
        connected: false,
        durationMs: Date.now() - start,
        error: err.message,
        rejectedAtHandshake: true,
      });
    });
  });
}

async function run() {
  console.log("=============================================================");
  console.log("Part A: Socket.IO Authentication Enforcement Evaluation");
  console.log("=============================================================\n");

  const WORKER_URL = "http://127.0.0.1:8787";
  const DIRECT_URL = "http://127.0.0.1:5000";

  console.log("--- Testing via Cloudflare Worker Proxy ---");
  const workerNoAuth = await testSocketAuth(WORKER_URL, "Worker - No Auth Credentials", {});
  console.log("1. No Auth Credentials:   ", workerNoAuth);

  const workerInvalidAuth = await testSocketAuth(WORKER_URL, "Worker - Invalid Token", { token: invalidToken });
  console.log("2. Invalid Token:         ", workerInvalidAuth);

  const workerExpiredAuth = await testSocketAuth(WORKER_URL, "Worker - Expired Token", { token: expiredToken });
  console.log("3. Expired Token:         ", workerExpiredAuth);

  const workerValidAuth = await testSocketAuth(WORKER_URL, "Worker - Valid Test Token", { token: validToken });
  console.log("4. Valid Test Token:      ", workerValidAuth);

  console.log("\n--- Testing Direct Express Origin (Baseline Control) ---");
  const directNoAuth = await testSocketAuth(DIRECT_URL, "Direct - No Auth Credentials", {});
  console.log("5. Direct - No Auth:      ", directNoAuth);

  const directInvalidAuth = await testSocketAuth(DIRECT_URL, "Direct - Invalid Token", { token: invalidToken });
  console.log("6. Direct - Invalid Token:", directInvalidAuth);

  const directValidAuth = await testSocketAuth(DIRECT_URL, "Direct - Valid Token", { token: validToken });
  console.log("7. Direct - Valid Token:  ", directValidAuth);

  console.log("\n=============================================================");
  console.log("SUMMARY OF PART A FINDINGS:");
  console.log(`- Worker No-Auth Connection:        ${workerNoAuth.connected ? "Connected (Handshake Allowed)" : "Rejected"}`);
  console.log(`- Worker Invalid-Token Connection:  ${workerInvalidAuth.connected ? "Connected (Handshake Allowed)" : "Rejected"}`);
  console.log(`- Worker Valid-Token Connection:    ${workerValidAuth.connected ? "Connected (Handshake Allowed)" : "Rejected"}`);
  console.log(`- Direct Express Parity Match:      ${workerNoAuth.connected === directNoAuth.connected && workerValidAuth.connected === directValidAuth.connected ? "100% Identical Behavior" : "Mismatch"}`);
  console.log("=============================================================");
}

run().catch(console.error);
