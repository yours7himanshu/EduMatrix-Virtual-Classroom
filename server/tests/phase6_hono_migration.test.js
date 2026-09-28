/*
 * EduMatrix Cloudflare Workers Migration — Phase 6: Hono Routing Framework Suite
 * Validates Hono application routing, request/response contracts, CORS, error handling,
 * and authentication boundary preservation under the Hono engine.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { createHonoApp } = require("../honoApp");

describe("Phase 6: Hono Routing Framework Migration Suite", () => {
  const app = createHonoApp();

  test("1. Hono Health Check: GET /health returns 200 OK and healthy status", async () => {
    const req = new Request("http://localhost/health", { method: "GET" });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, "healthy");
    assert.equal(body.runtime, "cloudflare-workers");
    assert.equal(body.framework, "hono");
  });

  test("2. Hono Root Route: GET / returns 200 OK with server message", async () => {
    const req = new Request("http://localhost/", { method: "GET" });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, "healthy");
    assert.equal(body.message, "Welcome to my Server");
  });

  test("3. Hono CORS: OPTIONS preflight request responds with permitted headers", async () => {
    const req = new Request("http://localhost/api/v1/login", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(res.headers.get("access-control-allow-credentials"), "true");
  });

  test("4. Hono Route Parity: POST /api/v9/aiPredictor evaluates placement", async () => {
    const req = new Request("http://localhost/api/v9/aiPredictor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks: 80, attendance: 75, branch: "CSE" }),
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.prediction.result, "Placed");
    assert.equal(body.prediction.marks, 80);
    assert.equal(body.prediction.attendance, 75);
    assert.equal(body.prediction.branch, "CSE");
  });

  test("5. Hono Route Parity: POST /api/v9/aiPredictor rejects invalid input with 400", async () => {
    const req = new Request("http://localhost/api/v9/aiPredictor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks: "invalid", attendance: 75 }),
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /valid numeric values/);
  });

  test("6. Hono Auth Boundary: Protected route rejects request missing Authorization header with 401", async () => {
    const req = new Request("http://localhost/api/v4/teacher-detail", {
      method: "GET",
    });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: "test_jwt_secret_phase6_test" });
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not authorized/i);
  });

  test("7. Hono Auth Boundary: Protected route rejects invalid token with 401", async () => {
    const req = new Request("http://localhost/api/v4/teacher-detail", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid.jwt.token",
      },
    });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: "test_jwt_secret_phase6_test" });
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.success, false);
  });

  test("8. Hono 404 Not Found: Unknown route returns 404 JSON response", async () => {
    const req = new Request("http://localhost/non-existent-api-endpoint", {
      method: "GET",
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, "Route not found");
  });

  test("9. Hono Query Parameter Passing: Query strings are parsed and made available to handlers", async () => {
    let capturedQuery = null;
    const testApp = createHonoApp();
    testApp.get("/test/query-inspect", (c) => {
      capturedQuery = c.req.query();
      return c.json({ ok: true, query: capturedQuery });
    });

    const req = new Request("http://localhost/test/query-inspect?page=3&sort=asc&filter=active", {
      method: "GET",
    });
    const res = await testApp.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 200);
    assert.equal(capturedQuery.page, "3");
    assert.equal(capturedQuery.sort, "asc");
    assert.equal(capturedQuery.filter, "active");
  });

  test("10. Hono Route Parity: POST /api/generate rejects empty prompt with 400", async () => {
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /prompt/i);
  });

  test("11. Hono Route Parity: POST /api/ai/generate rejects empty prompt with 400", async () => {
    const req = new Request("http://localhost/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" }),
    });
    const res = await app.fetch(req, { NODE_ENV: "test" });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /prompt/i);
  });

  test("12. Hono Route Parity: Both /api/ai-assistent and /api/ai/ai-assistent are routed", async () => {
    const req1 = new Request("http://localhost/api/ai-assistent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Hello" }),
    });
    const res1 = await app.fetch(req1, { NODE_ENV: "test" });
    assert.notEqual(res1.status, 404, "/api/ai-assistent must not return 404");

    const req2 = new Request("http://localhost/api/ai/ai-assistent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Hello" }),
    });
    const res2 = await app.fetch(req2, { NODE_ENV: "test" });
    assert.notEqual(res2.status, 404, "/api/ai/ai-assistent must not return 404");
  });

  test("13. Hono Quiz Auth: GET /api/quizzes rejects unauthenticated access with 401", async () => {
    const req = new Request("http://localhost/api/quizzes", { method: "GET" });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: "test_jwt_secret" });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not authorized/i);
  });

  test("14. Hono Quiz Auth: GET /quizzes root alias rejects unauthenticated access with 401", async () => {
    const req = new Request("http://localhost/quizzes", { method: "GET" });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: "test_jwt_secret" });
    assert.equal(res.status, 401);
  });

  test("15. Hono Quiz Auth: POST /api/quizzes/:id/submit rejects unauthenticated submission with 401", async () => {
    const req = new Request("http://localhost/api/quizzes/507f1f77bcf86cd799439011/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { 0: 1 } }),
    });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: "test_jwt_secret" });
    assert.equal(res.status, 401);
  });

  test("16. Hono Quiz Catch-Up: GET /api/quizzes/events returns recent events for authenticated student", async () => {
    const jwt = require("jsonwebtoken");
    const testSecret = "test_jwt_secret_events";
    const studentToken = jwt.sign(
      { userId: "student_events_1", role: "Student", institutionId: "inst_alpha" },
      testSecret
    );
    const req = new Request("http://localhost/api/quizzes/events", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const res = await app.fetch(req, { NODE_ENV: "test", JWT_SECRET: testSecret });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.events));
  });
});
