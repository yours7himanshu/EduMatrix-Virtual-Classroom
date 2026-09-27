// Test script to evaluate the Cloudflare Worker PoC endpoints
const endpoints = [
  { name: "Health Check", url: "http://127.0.0.1:8787/health" },
  { name: "Outbound TLS Socket Probe (Port 27017)", url: "http://127.0.0.1:8787/test-socket" },
  { name: "Native MongoDB Driver (SRV URI)", url: "http://127.0.0.1:8787/test-db?mode=srv" },
  { name: "Native MongoDB Driver (Direct Replica URI)", url: "http://127.0.0.1:8787/test-db?mode=direct" },
  { name: "Mongoose ODM (SRV URI)", url: "http://127.0.0.1:8787/test-mongoose?mode=srv" },
  { name: "Mongoose ODM (Direct Replica URI)", url: "http://127.0.0.1:8787/test-mongoose?mode=direct" },
];

async function runSingleTest(name, url) {
  const start = Date.now();
  console.log(`\n========================================`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    const duration = Date.now() - start;
    const status = res.status;
    const body = await res.json();
    console.log(`HTTP Status: ${status} (took ${duration}ms)`);
    console.log(`Response Body:`, JSON.stringify(body, null, 2));
    return { name, status, duration, body, success: status === 200 && body.success };
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`FAILED with exception (took ${duration}ms):`, err.message);
    return { name, status: 0, duration, error: err.message, success: false };
  }
}

async function testSequential(url, iterations = 3) {
  console.log(`\n========================================`);
  console.log(`Sequential Connection Reuse Test (${iterations} requests): ${url}`);
  const results = [];
  for (let i = 1; i <= iterations; i++) {
    const start = Date.now();
    try {
      const res = await fetch(url);
      const duration = Date.now() - start;
      const body = await res.json();
      console.log(` Req #${i}: HTTP ${res.status} | Time: ${duration}ms | Reused: ${body.metrics?.isConnectionReused} | ReadyState: ${body.metrics?.mongooseReadyState ?? 'N/A'}`);
      results.push({ i, status: res.status, duration, reused: body.metrics?.isConnectionReused });
    } catch (err) {
      console.log(` Req #${i}: Error: ${err.message}`);
      results.push({ i, error: err.message });
    }
  }
  return results;
}

async function main() {
  console.log("Starting Cloudflare Workers MongoDB Compatibility Test Suite...");
  
  const testResults = [];
  for (const ep of endpoints) {
    const result = await runSingleTest(ep.name, ep.url);
    testResults.push(result);
  }

  // Sequential test on health
  await testSequential("http://127.0.0.1:8787/health", 3);

  // If direct driver worked, test sequential on direct driver
  await testSequential("http://127.0.0.1:8787/test-db?mode=direct", 3);

  // If direct mongoose worked, test sequential on direct mongoose
  await testSequential("http://127.0.0.1:8787/test-mongoose?mode=direct", 3);

  console.log("\n========================================");
  console.log("TEST SUITE RUN COMPLETED.");
}

main().catch(console.error);
