import http from "node:http";
import proxyModule from "./src/proxy.js";

const proxy = proxyModule.default || proxyModule;

/**
 * Security Regression Test Suite: Open-Proxy & Upstream URL Hardening
 * 
 * Verifies:
 * 1. Scheme-relative paths (//evil.example) are rejected with HTTP 400.
 * 2. Multi-slash and backslash variants (///, /\, //\, etc.) are rejected with HTTP 400.
 * 3. Percent-encoded variants (/%2f%2f, /%5c, etc.) are rejected with HTTP 400.
 * 4. Malformed URI encodings are rejected safely with HTTP 400.
 * 5. Credentials (Bearer tokens, cookies) are NEVER forwarded on rejected requests.
 * 6. Legitimate API paths and query parameters are forwarded faithfully to the configured origin.
 * 7. Non-GET methods, headers, and body streaming continue to function.
 */

async function main() {
  console.log("=============================================================");
  console.log("EduMatrix Security Remediation — Open-Proxy Fix Test Suite");
  console.log("=============================================================\n");

  let mockOriginRequests = [];
  let evilHostRequests = [];

  // 1. Setup local mock origin server
  const mockOriginServer = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      mockOriginRequests.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
      });
      res.writeHead(200, {
        "Content-Type": "application/json",
        "X-Mock-Origin": "true",
      });
      res.end(JSON.stringify({ success: true, receivedUrl: req.url }));
    });
  });

  // 2. Setup unintended / "evil" server to monitor for unauthorized forwarding
  const evilServer = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      evilHostRequests.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ captured: true }));
    });
  });

  await new Promise((resolve) => mockOriginServer.listen(54321, "127.0.0.1", resolve));
  await new Promise((resolve) => evilServer.listen(54322, "127.0.0.1", resolve));

  const originUrl = "http://127.0.0.1:54321";
  const env = { ORIGIN_URL: originUrl };

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  function record(testName, passed, details = "") {
    if (passed) {
      passedCount++;
      console.log(`[PASS] ${testName} ${details ? "- " + details : ""}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} ${details ? "- " + details : ""}`);
    }
    results.push({ testName, passed, details });
  }

  try {
    console.log("--- PART 1: Malicious & Scheme-Relative Path Rejection ---");

    const rejectionTestCases = [
      {
        name: "Scheme-relative double slash: //127.0.0.1:54322/capture",
        url: "http://worker.local//127.0.0.1:54322/capture",
        expectedStatus: 400,
      },
      {
        name: "Triple slash: ///127.0.0.1:54322/capture",
        url: "http://worker.local///127.0.0.1:54322/capture",
        expectedStatus: 400,
      },
      {
        name: "Quad slash: ////evil.example/capture",
        url: "http://worker.local////evil.example/capture",
        expectedStatus: 400,
      },
      {
        name: "Slash-backslash combination: /\\127.0.0.1:54322/capture",
        url: "http://worker.local/\\127.0.0.1:54322/capture",
        expectedStatus: 400,
      },
      {
        name: "Double-slash-backslash: //\\127.0.0.1:54322/capture",
        url: "http://worker.local//\\127.0.0.1:54322/capture",
        expectedStatus: 400,
      },
      {
        name: "Encoded double slash: /%2f%2fevil.example/capture",
        url: "http://worker.local/%2f%2fevil.example/capture",
        expectedStatus: 400,
      },
      {
        name: "Encoded slash after initial slash: /%2fevil.example/capture",
        url: "http://worker.local/%2fevil.example/capture",
        expectedStatus: 400,
      },
      {
        name: "Encoded backslashes: /%5c%5cevil.example/capture",
        url: "http://worker.local/%5c%5cevil.example/capture",
        expectedStatus: 400,
      },
      {
        name: "Mixed encoded slash-backslash: /%2f%5cevil.example/capture",
        url: "http://worker.local/%2f%5cevil.example/capture",
        expectedStatus: 400,
      },
      {
        name: "Malformed percent-encoding in path: /%E0%A4%A",
        url: "http://worker.local/%E0%A4%A",
        expectedStatus: 400,
      },
    ];

    for (const tc of rejectionTestCases) {
      evilHostRequests = [];
      mockOriginRequests = [];

      const req = new Request(tc.url, {
        method: "GET",
        headers: {
          "Authorization": "Bearer test-sensitive-jwt-token",
          "Cookie": "token=sensitive-cookie-jwt",
          "X-Client-Custom": "confidential-data",
        },
      });

      const res = await proxy.fetch(req, env, {});
      const body = await res.json().catch(() => ({}));

      const rejected = res.status === tc.expectedStatus && body.error === "Bad Request";
      const noEvilLeak = evilHostRequests.length === 0;
      const noOriginLeak = mockOriginRequests.length === 0;

      record(
        tc.name,
        rejected && noEvilLeak && noOriginLeak,
        `Status: ${res.status} | Evil server requests: ${evilHostRequests.length} | Body: ${body.message}`
      );
    }

    console.log("\n--- PART 2: Legitimate Request Forwarding Parity ---");

    const acceptanceTestCases = [
      {
        name: "Ordinary root path: /",
        url: "http://worker.local/",
        method: "GET",
        expectedStatus: 200,
        expectedOriginPath: "/",
      },
      {
        name: "Standard API endpoint: /api/v3/displayAnnouncement",
        url: "http://worker.local/api/v3/displayAnnouncement",
        method: "GET",
        expectedStatus: 200,
        expectedOriginPath: "/api/v3/displayAnnouncement",
      },
      {
        name: "API path with query parameters: /api/v1/items?page=2&limit=25",
        url: "http://worker.local/api/v1/items?page=2&limit=25",
        method: "GET",
        expectedStatus: 200,
        expectedOriginPath: "/api/v1/items?page=2&limit=25",
      },
      {
        name: "Query parameter containing scheme-like string: /api/v1/redirect?target=//safe.org",
        url: "http://worker.local/api/v1/redirect?target=//safe.org",
        method: "GET",
        expectedStatus: 200,
        expectedOriginPath: "/api/v1/redirect?target=//safe.org",
      },
      {
        name: "Socket.IO polling path: /socket.io/?EIO=4&transport=polling&t=P8d7A1",
        url: "http://worker.local/socket.io/?EIO=4&transport=polling&t=P8d7A1",
        method: "GET",
        expectedStatus: 200,
        expectedOriginPath: "/socket.io/?EIO=4&transport=polling&t=P8d7A1",
      },
      {
        name: "POST request with JSON body & credentials: /api/v1/login",
        url: "http://worker.local/api/v1/login",
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid-student-token",
          "Cookie": "token=valid-cookie-token",
        },
        expectedStatus: 200,
        expectedOriginPath: "/api/v1/login",
        checkCredentials: true,
      },
      {
        name: "OPTIONS preflight request: /api/v10/fees/ledger",
        url: "http://worker.local/api/v10/fees/ledger",
        method: "OPTIONS",
        headers: {
          "Access-Control-Request-Method": "GET",
          "Origin": "http://localhost:5173",
        },
        expectedStatus: 200,
        expectedOriginPath: "/api/v10/fees/ledger",
      },
    ];

    for (const tc of acceptanceTestCases) {
      mockOriginRequests = [];

      const reqInit = {
        method: tc.method,
        headers: tc.headers || {},
      };
      if (tc.body) {
        reqInit.body = tc.body;
      }

      const req = new Request(tc.url, reqInit);
      const res = await proxy.fetch(req, env, {});
      const body = await res.json().catch(() => ({}));

      const statusMatches = res.status === tc.expectedStatus;
      const originReceived = mockOriginRequests.length === 1;
      const pathMatches = originReceived && mockOriginRequests[0].url === tc.expectedOriginPath;
      const edgeHeaderPresent = res.headers.get("x-edge-proxied-by") === "EduMatrix-Cloudflare-Worker";

      let credsVerified = true;
      if (tc.checkCredentials && originReceived) {
        const receivedHeaders = mockOriginRequests[0].headers;
        credsVerified =
          receivedHeaders["authorization"] === "Bearer valid-student-token" &&
          receivedHeaders["cookie"] === "token=valid-cookie-token";
      }

      record(
        tc.name,
        statusMatches && originReceived && pathMatches && edgeHeaderPresent && credsVerified,
        `Status: ${res.status} | Origin received path: ${mockOriginRequests[0]?.url} | Proxied header: ${edgeHeaderPresent}`
      );
    }

    console.log("\n--- PART 3: Bad Gateway Error Sanitization ---");
    // Test 502 error when upstream is unreachable (port with nothing listening)
    const deadEnv = { ORIGIN_URL: "http://127.0.0.1:54329" };
    const deadReq = new Request("http://worker.local/api/v1/health", { method: "GET" });
    const deadRes = await proxy.fetch(deadReq, deadEnv, {});
    const deadBody = await deadRes.json();

    const is502 = deadRes.status === 502;
    const noInternalTarget = deadBody.target === undefined;
    const noInternalDetail = deadBody.detail === undefined;
    record(
      "502 Bad Gateway response does NOT leak internal target URL or error detail",
      is502 && noInternalTarget && noInternalDetail,
      `Status: ${deadRes.status} | Body keys: ${Object.keys(deadBody).join(", ")}`
    );

  } finally {
    await new Promise((resolve) => mockOriginServer.close(resolve));
    await new Promise((resolve) => evilServer.close(resolve));
  }

  console.log("\n=============================================================");
  console.log(`TEST SUMMARY: Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("=============================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
