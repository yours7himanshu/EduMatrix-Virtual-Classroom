import { io } from "../client/node_modules/socket.io-client/build/esm/index.js";

async function testWorkerSocket(transports = ["polling", "websocket"]) {
  return new Promise((resolve) => {
    console.log(`\n--- Testing Socket.IO via Cloudflare Worker (transports: ${JSON.stringify(transports)}) ---`);
    const start = Date.now();
    const socket = io("http://127.0.0.1:8787", {
      transports,
      reconnection: false,
      timeout: 5000,
    });

    let connected = false;
    let transportName = null;

    socket.on("connect", () => {
      connected = true;
      const durationMs = Date.now() - start;
      transportName = socket.io.engine.transport.name;
      console.log(`[CONNECT SUCCESS] Connected through Cloudflare Worker!`);
      console.log(`  Socket ID: ${socket.id}`);
      console.log(`  Negotiated Transport: ${transportName}`);
      console.log(`  Connect Duration: ${durationMs}ms`);

      socket.io.engine.on("upgrade", (transport) => {
        console.log(`  [UPGRADE] Transport upgraded to: ${transport.name}`);
        transportName = transport.name;
      });

      // Disconnect cleanly after 500ms
      setTimeout(() => {
        socket.disconnect();
      }, 500);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[DISCONNECT] Socket disconnected cleanly: ${reason}`);
      resolve({ success: connected, transport: transportName });
    });

    socket.on("connect_error", (err) => {
      const durationMs = Date.now() - start;
      console.error(`[CONNECT ERROR] Failed to connect through Worker (${durationMs}ms):`, err.message);
      resolve({ success: false, error: err.message });
    });
  });
}

async function run() {
  console.log("=== Testing Socket.IO Connection Through Local Cloudflare Worker Proxy ===");

  // Test 1: Pure HTTP Long-Polling
  const resPolling = await testWorkerSocket(["polling"]);

  // Test 2: Pure WebSocket Upgrade
  const resWebsocket = await testWorkerSocket(["websocket"]);

  // Test 3: Default Socket.IO (Polling -> WebSocket upgrade)
  const resDefault = await testWorkerSocket(["polling", "websocket"]);

  console.log("\n==================================================");
  console.log("Cloudflare Worker Socket.IO Proxy Test Summary:");
  console.log("1. Pure Polling:     ", resPolling);
  console.log("2. Pure WebSocket:   ", resWebsocket);
  console.log("3. Default Combined: ", resDefault);
  console.log("==================================================");
}

run().catch(console.error);
