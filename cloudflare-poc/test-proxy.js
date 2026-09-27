import fs from "node:fs";

// Load JWT_SECRET from ../server/.env safely without printing it
const serverEnv = fs.readFileSync("../server/.env", "utf8");
let jwtSecret = "";
for (const line of serverEnv.split("\n")) {
  if (line.startsWith("JWT_SECRET=")) {
    jwtSecret = line.slice(line.indexOf("=") + 1).trim();
    break;
  }
}

if (!jwtSecret) {
  console.error("Failed to load JWT_SECRET from ../server/.env");
  process.exit(1);
}

// Import jsonwebtoken from server dependencies
const { default: jwt } = await import("../server/node_modules/jsonwebtoken/index.js");

const PROXY_BASE = "http://127.0.0.1:8787";

async function runTest1() {
  console.log("\n=======================================================");
  console.log("TEST 1: Harmless Public GET Endpoint via Cloudflare Worker");
  console.log("Endpoint: GET " + PROXY_BASE + "/api/v3/displayAnnouncement");
  console.log("Expected Upstream: GET http://127.0.0.1:5000/api/v3/displayAnnouncement");

  const start = Date.now();
  const res = await fetch(PROXY_BASE + "/api/v3/displayAnnouncement", {
    headers: {
      "Accept": "application/json",
      "User-Agent": "EduMatrix-Proxy-Test/1.0",
    },
  });
  const durationMs = Date.now() - start;

  const status = res.status;
  const statusText = res.statusText;
  const headers = Object.fromEntries(res.headers.entries());
  const body = await res.json();

  console.log(`HTTP Status: ${status} ${statusText} (Latency: ${durationMs}ms)`);
  console.log(`Relevant Headers:`, {
    "x-edge-proxied-by": headers["x-edge-proxied-by"],
    "content-type": headers["content-type"],
    "access-control-allow-origin": headers["access-control-allow-origin"],
    "x-powered-by": headers["x-powered-by"],
  });
  console.log(`Response Body Preview:`, {
    success: body.success,
    itemCount: body.getAnnouncement ? body.getAnnouncement.length : 0,
    firstItem: body.getAnnouncement && body.getAnnouncement.length > 0 ? {
      category: body.getAnnouncement[0].category,
      course: body.getAnnouncement[0].course,
    } : null,
  });

  const passed = status === 200 && body.success === true && headers["x-edge-proxied-by"] === "EduMatrix-Cloudflare-Worker";
  console.log(`Test 1 Result: ${passed ? "PASSED" : "FAILED"}`);
  return { test: "Test 1 (Harmless GET)", passed, status, durationMs, headers, bodySummary: { success: body.success, count: body.getAnnouncement?.length } };
}

async function runTest2A() {
  console.log("\n=======================================================");
  console.log("TEST 2A: Authenticated Endpoint WITHOUT Credentials (Control)");
  console.log("Endpoint: GET " + PROXY_BASE + "/api/classrooms/my/enrolled");

  const start = Date.now();
  const res = await fetch(PROXY_BASE + "/api/classrooms/my/enrolled");
  const durationMs = Date.now() - start;
  const status = res.status;
  const headers = Object.fromEntries(res.headers.entries());
  const body = await res.json();

  console.log(`HTTP Status: ${status} ${res.statusText} (Latency: ${durationMs}ms)`);
  console.log(`Headers: x-edge-proxied-by = ${headers["x-edge-proxied-by"]}`);
  console.log(`Response Body:`, body);

  const passed = status === 401 && body.success === false;
  console.log(`Test 2A Result: ${passed ? "PASSED (Rejected as unauthorized)" : "FAILED"}`);
  return { test: "Test 2A (Unauthenticated)", passed, status, durationMs, body };
}

async function runTest2B() {
  console.log("\n=======================================================");
  console.log("TEST 2B: Authenticated Endpoint WITH Authorization: Bearer <token>");
  console.log("Endpoint: GET " + PROXY_BASE + "/api/classrooms/my/enrolled");

  // Sign a valid student test token (credentials redacted)
  const token = jwt.sign(
    {
      userId: "67e262949242443212378cb1",
      role: "student",
      email: "proxy-test@student.edu",
      name: "Proxy Test Student",
    },
    jwtSecret,
    { expiresIn: "1h" }
  );

  const start = Date.now();
  const res = await fetch(PROXY_BASE + "/api/classrooms/my/enrolled", {
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
    },
  });
  const durationMs = Date.now() - start;
  const status = res.status;
  const headers = Object.fromEntries(res.headers.entries());
  const body = await res.json();

  console.log(`HTTP Status: ${status} ${res.statusText} (Latency: ${durationMs}ms)`);
  console.log(`Headers: x-edge-proxied-by = ${headers["x-edge-proxied-by"]}`);
  console.log(`Response Body:`, body);

  const passed = status === 200 && body.success === true;
  console.log(`Test 2B Result: ${passed ? "PASSED (Authorized & Accepted)" : "FAILED"}`);
  return { test: "Test 2B (Bearer Auth)", passed, status, durationMs, body };
}

async function runTest2C() {
  console.log("\n=======================================================");
  console.log("TEST 2C: Authenticated Endpoint WITH Cookie: token=<token>");
  console.log("Endpoint: GET " + PROXY_BASE + "/api/classrooms/my/enrolled");

  // Sign a valid student test token
  const token = jwt.sign(
    {
      userId: "67e262949242443212378cb1",
      role: "student",
      email: "cookie-proxy-test@student.edu",
      name: "Cookie Student",
    },
    jwtSecret,
    { expiresIn: "1h" }
  );

  const start = Date.now();
  const res = await fetch(PROXY_BASE + "/api/classrooms/my/enrolled", {
    headers: {
      "Cookie": "token=" + token,
      "Accept": "application/json",
    },
  });
  const durationMs = Date.now() - start;
  const status = res.status;
  const headers = Object.fromEntries(res.headers.entries());
  const body = await res.json();

  console.log(`HTTP Status: ${status} ${res.statusText} (Latency: ${durationMs}ms)`);
  console.log(`Headers: x-edge-proxied-by = ${headers["x-edge-proxied-by"]}`);
  console.log(`Response Body:`, body);

  const passed = status === 200 && body.success === true;
  console.log(`Test 2C Result: ${passed ? "PASSED (Cookie Auth Accepted)" : "FAILED"}`);
  return { test: "Test 2C (Cookie Auth)", passed, status, durationMs, body };
}

async function main() {
  console.log("Starting Minimal Cloudflare Worker Reverse Proxy Validation Suite...");
  const t1 = await runTest1();
  const t2a = await runTest2A();
  const t2b = await runTest2B();
  const t2c = await runTest2C();

  console.log("\n=======================================================");
  console.log("SUMMARY OF PROTOTYPE VALIDATION RESULTS:");
  console.log(`1. Harmless GET (Display Announcements): ${t1.passed ? "SUCCESS (200 OK)" : "FAILURE"}`);
  console.log(`2. Unauthenticated Control Check:        ${t2a.passed ? "SUCCESS (401 Unauthorized)" : "FAILURE"}`);
  console.log(`3. Bearer Header Auth Forwarding:        ${t2b.passed ? "SUCCESS (200 OK)" : "FAILURE"}`);
  console.log(`4. Cookie Auth Forwarding:               ${t2c.passed ? "SUCCESS (200 OK)" : "FAILURE"}`);
}

main().catch(console.error);
