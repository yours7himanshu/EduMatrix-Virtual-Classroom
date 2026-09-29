import { io } from "../client/node_modules/socket.io-client/build/esm/index.js";

function testDirect(transports = ["polling", "websocket"]) {
  return new Promise((resolve) => {
    console.log(`\n--- Testing Direct Express Socket.IO (transports: ${JSON.stringify(transports)}) ---`);
    const start = Date.now();
    const socket = io("http://127.0.0.1:5000", {
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
      console.log(`[CONNECT SUCCESS] Connected directly to Express!`);
      console.log(`  Socket ID: ${socket.id}`);
      console.log(`  Initial Transport: ${transportName}`);
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
      console.error(`[CONNECT ERROR] Failed to connect directly (${durationMs}ms):`, err.message);
      resolve({ success: false, error: err.message });
    });
  });
}

async function run() {
  // Test 1: Default transports (polling with upgrade)
  const res1 = await testDirect(["polling", "websocket"]);
  
  // Test 2: Pure websocket transport
  const res2 = await testDirect(["websocket"]);

  console.log("\nDirect Express Socket.IO Baseline Summary:", {
    defaultTransports: res1,
    pureWebsocket: res2,
  });
}

run().catch(console.error);
