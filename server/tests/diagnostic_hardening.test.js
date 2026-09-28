/*
 * EduMatrix Cloudflare Workers Migration — Diagnostic Hardening Suite
 * 
 * Validates default-deny policy for diagnostic endpoints:
 * 1. Absent ENABLE_DIAGNOSTICS binding -> 404 Not Found
 * 2. ENABLE_DIAGNOSTICS === "false" -> 404 Not Found
 * 3. NODE_ENV === "production" -> 404 Not Found (even if ENABLE_DIAGNOSTICS === "true")
 * 4. Arbitrary host/port probing rejected with 403 Forbidden (Anti-SSRF)
 * 5. Diagnostic errors sanitize credentials and connection strings
 * 6. Orphaned /test-single-node route is removed
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

// Import the worker entrypoint
let workerModule;
try {
  workerModule = require("../../cloudflare-poc/src/index.js");
} catch {
  // If ES module, dynamic import in before
}

describe("Diagnostic Endpoints Hardening Suite (Default-Deny Policy)", async () => {
  const worker = workerModule?.default || (await import("../../cloudflare-poc/src/index.js")).default;

  const diagnosticPaths = [
    "/db/live-verify",
    "/test-db",
    "/test-driver",
    "/test-mongoose",
    "/test-node-tls",
    "/test-socket",
  ];

  test("1. Default-Deny: Diagnostics return 404 when ENABLE_DIAGNOSTICS is absent", async () => {
    for (const path of diagnosticPaths) {
      const req = new Request(`http://localhost${path}`, { method: "GET" });
      const env = { NODE_ENV: "development" }; // No ENABLE_DIAGNOSTICS
      const res = await worker.fetch(req, env);

      assert.equal(res.status, 404, `Path ${path} must return 404 when ENABLE_DIAGNOSTICS is absent`);
      const body = await res.json();
      assert.match(body.error || body.message, /not found/i);
    }
  });

  test("2. Default-Deny: Diagnostics return 404 when ENABLE_DIAGNOSTICS is 'false'", async () => {
    for (const path of diagnosticPaths) {
      const req = new Request(`http://localhost${path}`, { method: "GET" });
      const env = { NODE_ENV: "development", ENABLE_DIAGNOSTICS: "false" };
      const res = await worker.fetch(req, env);

      assert.equal(res.status, 404, `Path ${path} must return 404 when ENABLE_DIAGNOSTICS is false`);
    }
  });

  test("3. Production Guard: Diagnostics return 404 in production even if ENABLE_DIAGNOSTICS is 'true'", async () => {
    for (const path of diagnosticPaths) {
      const req = new Request(`http://localhost${path}`, { method: "GET" });
      const env = { NODE_ENV: "production", ENABLE_DIAGNOSTICS: "true" };
      const res = await worker.fetch(req, env);

      assert.equal(res.status, 404, `Path ${path} must return 404 in production environment`);
    }
  });

  test("4. Anti-SSRF: /test-socket rejects arbitrary host and port probing with 403 Forbidden", async () => {
    const maliciousTargets = [
      { host: "169.254.169.254", port: 80 },
      { host: "internal.database.local", port: 27017 },
      { host: "127.0.0.1", port: 22 },
      { host: "cluster0-shard-00-00.mkcqp.mongodb.net", port: 8080 }, // Valid host, wrong port
    ];

    for (const target of maliciousTargets) {
      const req = new Request(`http://localhost/test-socket?host=${target.host}&port=${target.port}`, { method: "GET" });
      const env = { NODE_ENV: "development", ENABLE_DIAGNOSTICS: "true" };
      const res = await worker.fetch(req, env);

      assert.equal(res.status, 403, `Arbitrary target ${target.host}:${target.port} must be rejected with 403`);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error, /arbitrary host or port probing is not permitted/i);
    }
  });

  test("5. Dead Code Removal: /test-single-node returns 404 Not Found", async () => {
    const req = new Request("http://localhost/test-single-node", { method: "GET" });
    const env = { NODE_ENV: "development", ENABLE_DIAGNOSTICS: "true" };
    const res = await worker.fetch(req, env);

    assert.equal(res.status, 404, "/test-single-node must return 404 as dead code has been removed");
  });

  test("6. Failure & Redaction: /db/live-verify?testFailure=true redacts passwords in error responses", async () => {
    const req = new Request("http://localhost/db/live-verify?testFailure=true", { method: "GET" });
    const env = { NODE_ENV: "development", ENABLE_DIAGNOSTICS: "true" };
    const res = await worker.fetch(req, env);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.failureHandled, true);
    assert.equal(body.credentialsRedacted, true);
    assert.ok(!body.sanitizedError.includes("SecretPassword123!"));
    assert.ok(!body.sanitizedError.includes("fakeUser"));
  });

  test("7. Direct URI Sanitization: connectDB.sanitizeMongoUri redacts credentials from URIs and error traces", async () => {
    const connectDB = (await import("../db/db.js")).default;
    const rawUri = "mongodb://dbAdminUser:SuperSecretPassword123!@cluster0.mkcqp.mongodb.net/edumatrix";
    const sanitized = connectDB.sanitizeMongoUri(rawUri);
    assert.ok(!sanitized.includes("SuperSecretPassword123!"));
    assert.ok(!sanitized.includes("dbAdminUser"));
    assert.ok(sanitized.includes("[REDACTED_CREDENTIALS]"));
  });
});
