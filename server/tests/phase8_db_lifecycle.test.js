/*
 * EduMatrix Cloudflare Workers Migration — Phase 8: Bounded DB Lifecycle Suite
 *
 * Verifies that MongoDB initialization no longer blocks unrelated requests,
 * that database failures produce fast, explicit 503 responses (never hangs or
 * misleading results), and that the login contract is preserved.
 *
 * Fully offline: no live database, no secrets, no network. Never asserts on
 * secret values; asserts that serialized diagnostics contain no URI material.
 */

const { test, describe, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const connectDB = require("../db/db");
const { createHonoApp } = require("../honoApp");
const Students = require("../models/studentModels");

const SAVED_ENV = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DIRECT_URI: process.env.MONGO_DIRECT_URI,
  MONGO_CONNECTION_MODE: process.env.MONGO_CONNECTION_MODE,
};

function clearDbEnv() {
  delete process.env.MONGO_URI;
  delete process.env.MONGO_DIRECT_URI;
  delete process.env.MONGO_CONNECTION_MODE;
}

function restoreEnv() {
  for (const [key, value] of Object.entries(SAVED_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe("Phase 8: Bounded DB Lifecycle Suite", () => {
  let app;
  let origMongooseConnect;
  let origEnsure;
  let origFindOne;
  let connectCalls;

  before(() => {
    app = createHonoApp();
    origMongooseConnect = mongoose.connect;
    origEnsure = connectDB.ensureDbConnected;
    origFindOne = Students.findOne;
  });

  beforeEach(() => {
    clearDbEnv();
    connectDB.resetDbFailureState();
    connectCalls = 0;
    mongoose.connect = async (...args) => {
      connectCalls += 1;
      return origMongooseConnect.apply(mongoose, args);
    };
    connectDB.ensureDbConnected = origEnsure;
    Students.findOne = origFindOne;
  });

  after(() => {
    mongoose.connect = origMongooseConnect;
    connectDB.ensureDbConnected = origEnsure;
    Students.findOne = origFindOne;
    restoreEnv();
  });

  test("1. GET /health responds 200 quickly without touching Mongoose", async () => {
    mongoose.connect = async () => {
      connectCalls += 1;
      throw new Error("mongoose.connect must not be called for /health");
    };
    const start = Date.now();
    const res = await app.fetch(new Request("http://localhost/health"), { NODE_ENV: "test" });
    const elapsed = Date.now() - start;
    assert.equal(res.status, 200);
    assert.ok(elapsed < 3000, `health must be fast without DB (took ${elapsed}ms)`);
    const body = await res.json();
    assert.equal(body.status, "healthy");
    assert.equal(connectCalls, 0);
  });

  test("2. CORS preflight (OPTIONS) completes 204 without database access", async () => {
    mongoose.connect = async () => {
      connectCalls += 1;
      throw new Error("mongoose.connect must not be called for preflight");
    };
    const res = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "OPTIONS",
        headers: { Origin: "https://virtual-classroom-application.vercel.app" },
      }),
      { NODE_ENV: "test" }
    );
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "https://virtual-classroom-application.vercel.app");
    assert.equal(connectCalls, 0);
  });

  test("3. Socket.IO polling fails explicitly (503) without DB and without fake sessions", async () => {
    const res = await app.fetch(
      new Request("http://localhost/socket.io/?EIO=4&transport=polling"),
      { NODE_ENV: "test" }
    );
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /polling transport unavailable/i);
    assert.equal(connectCalls, 0, "polling must not initialize the database");
  });

  test("3b. Early rejections still carry CORS headers for the allowed origin", async () => {
    const origin = "https://virtual-classroom-application.vercel.app";
    const loginRes = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ email: "ghost@example.com", password: "Whatever123!" }),
      }),
      { NODE_ENV: "test" }
    );
    assert.equal(loginRes.status, 503);
    assert.equal(loginRes.headers.get("access-control-allow-origin"), origin);
    assert.equal(loginRes.headers.get("access-control-allow-credentials"), "true");

    const pollRes = await app.fetch(
      new Request("http://localhost/socket.io/?EIO=4&transport=polling", {
        headers: { Origin: origin },
      }),
      { NODE_ENV: "test" }
    );
    assert.equal(pollRes.status, 503);
    assert.equal(pollRes.headers.get("access-control-allow-origin"), origin);
  });

  test("4. Native /ws without upgrade still returns 426 without DB", async () => {
    const res = await app.fetch(new Request("http://localhost/ws"), { NODE_ENV: "test" });
    assert.equal(res.status, 426);
    assert.equal(connectCalls, 0);
  });

  test("5. GET /ready reports not-ready 503 with safe shape when unconfigured", async () => {
    const start = Date.now();
    const res = await app.fetch(new Request("http://localhost/ready"), { NODE_ENV: "test" });
    const elapsed = Date.now() - start;
    assert.equal(res.status, 503);
    assert.ok(elapsed < 3000, `readiness must fail fast without DB (took ${elapsed}ms)`);
    const body = await res.json();
    assert.equal(body.ready, false);
    assert.equal(body.uriKind, null);
    assert.ok(!JSON.stringify(body).includes("mongodb"), "readiness must never leak URI material");
  });

  test("6. ensureDbConnected without URIs fails fast with 503 missing-uri", async () => {
    const start = Date.now();
    await assert.rejects(connectDB.ensureDbConnected({ env: {} }), (err) => {
      assert.equal(err.status, 503);
      assert.equal(err.category, "missing-uri");
      return true;
    });
    assert.ok(Date.now() - start < 2000, "unconfigured DB must fail immediately");
  });

  test("7. Failure cooldown prevents retry storms but still recovers", async () => {
    await assert.rejects(connectDB.ensureDbConnected({ env: {} }));
    const start = Date.now();
    await assert.rejects(connectDB.ensureDbConnected({ env: {} }), (err) => {
      assert.equal(err.status, 503);
      assert.equal(err.category, "recent-failure");
      return true;
    });
    assert.ok(Date.now() - start < 1000, "cooldown rejection must be immediate");
    connectDB.resetDbFailureState();
    await assert.rejects(connectDB.ensureDbConnected({ env: {} }), (err) => {
      assert.equal(err.category, "missing-uri");
      return true;
    });
  });

  test("8. Unreachable host yields categorized 503 (no hang, no leak)", async () => {
    const env = { MONGO_URI: "mongodb://127.0.0.1:9/edumatrix_probe?directConnection=true" };
    const start = Date.now();
    await assert.rejects(connectDB.ensureDbConnected({ env }), (err) => {
      assert.equal(err.status, 503);
      assert.equal(err.code, "DB_UNAVAILABLE");
      assert.ok(err.category, "category must be set");
      assert.ok(!String(err.message).includes("127.0.0.1"), "client error must not echo host details");
      return true;
    });
    assert.ok(Date.now() - start < 20000, "unreachable host must stay bounded");
  });

  test("9. resolveConnectionMode/getDbStatus never expose URI values", async () => {
    assert.equal(connectDB.resolveConnectionMode({}), "srv");
    assert.equal(connectDB.resolveConnectionMode({ MONGO_CONNECTION_MODE: "direct" }), "direct");
    assert.equal(connectDB.resolveConnectionMode({ MONGO_CONNECTION_MODE: "bogus" }), "srv");
    process.env.MONGO_DIRECT_URI = "mongodb://probeuser:probepass@probehost/probedb";
    const status = connectDB.getDbStatus({ MONGO_CONNECTION_MODE: "direct" });
    assert.equal(status.mode, "direct");
    assert.equal(status.uriKind, "MONGO_DIRECT_URI");
    const serialized = JSON.stringify(status);
    assert.ok(!serialized.includes("probeuser"), "status must not leak username");
    assert.ok(!serialized.includes("probepass"), "status must not leak password");
    assert.ok(!serialized.includes("probehost"), "status must not leak host");
    delete process.env.MONGO_DIRECT_URI;
  });

  test("10. sanitizeMongoUri redacts credentials", () => {
    const out = connectDB.sanitizeMongoUri("mongodb+srv://alice:s3cret@cluster0.example.net/db?retryWrites=true");
    assert.ok(!out.includes("alice") && !out.includes("s3cret"));
    assert.ok(out.includes("[REDACTED_CREDENTIALS]"));
  });

  test("11. Login with unavailable DB returns 503 (never 500, never false user-not-found)", async () => {
    process.env.JWT_SECRET = "phase8_login_test_secret";
    const res = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ghost@example.com", password: "Whatever123!" }),
      }),
      { NODE_ENV: "test", JWT_SECRET: "phase8_login_test_secret" }
    );
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /unavailable|unreachable/i);
    assert.ok(!/does not exist/i.test(body.message), "DB outage must not masquerade as unknown user");
  });

  test("12. Login success contract preserved with mocked lookup", async () => {
    connectDB.ensureDbConnected = async () => mongoose;
    process.env.JWT_SECRET = "phase8_login_contract_secret";
    const password = "CorrectHorse123!";
    const hash = await bcrypt.hash(password, 4);
    const fakeId = new mongoose.Types.ObjectId();
    Students.findOne = async () => ({
      _id: fakeId,
      email: "student@example.com",
      name: "Test Student",
      role: "student",
      password: hash,
      institutionId: new mongoose.Types.ObjectId(),
    });
    const res = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@example.com", password }),
      }),
      { NODE_ENV: "test", JWT_SECRET: "phase8_login_contract_secret" }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(typeof body.token === "string" && body.token.length > 0);
    const decoded = jwt.verify(body.token, "phase8_login_contract_secret");
    assert.equal(decoded.email, "student@example.com");
    assert.equal(String(decoded.userId), String(fakeId));
  });

  test("13. Invalid password still 401; unknown user still 404 (mocked DB)", async () => {
    connectDB.ensureDbConnected = async () => mongoose;
    process.env.JWT_SECRET = "phase8_login_negative_secret";
    const hash = await bcrypt.hash("RightPassword123!", 4);
    Students.findOne = async () => ({ _id: new mongoose.Types.ObjectId(), password: hash, role: "student" });

    const badPass = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@example.com", password: "WrongPassword123!" }),
      }),
      { NODE_ENV: "test", JWT_SECRET: "phase8_login_negative_secret" }
    );
    assert.equal(badPass.status, 401);
    assert.match((await badPass.json()).message, /invalid credentials/i);

    Students.findOne = async () => null;
    const unknown = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nobody@example.com", password: "Whatever123!" }),
      }),
      { NODE_ENV: "test", JWT_SECRET: "phase8_login_negative_secret" }
    );
    assert.equal(unknown.status, 404);
    assert.match((await unknown.json()).message, /does not exist/i);
  });

  test("14. Missing JWT configuration yields distinct 503 (not generic 500)", async () => {
    connectDB.ensureDbConnected = async () => mongoose;
    delete process.env.JWT_SECRET;
    const hash = await bcrypt.hash("SomePassword123!", 4);
    Students.findOne = async () => ({ _id: new mongoose.Types.ObjectId(), password: hash, role: "student" });
    const res = await app.fetch(
      new Request("http://localhost/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@example.com", password: "SomePassword123!" }),
      }),
      { NODE_ENV: "test" }
    );
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.message, /not configured/i);
  });

  test("15. Authenticated quiz-events without DB returns explicit 503", async () => {
    const secret = "phase8_quiz_events_secret";
    process.env.JWT_SECRET = secret;
    const token = jwt.sign({ userId: "student_1", role: "student", institutionId: "inst_1" }, secret);
    const res = await app.fetch(
      new Request("http://localhost/api/quizzes/events", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      { NODE_ENV: "test", JWT_SECRET: secret }
    );
    assert.equal(res.status, 503);
    assert.equal((await res.json()).success, false);
  });

  test("16. Atlas selection failure classifies as server-selection-timeout", () => {
    const atlasMsg =
      "Could not connect to any servers in your MongoDB Atlas cluster. " +
      "One common reason is that you're trying to access the database from " +
      "an IP that isn't whitelisted.";
    assert.equal(connectDB.classifyDbError(atlasMsg), "server-selection-timeout");
    assert.equal(connectDB.classifyDbError("querySrv ENOTFOUND _mongodb._tcp.x"), "dns");
    assert.equal(connectDB.classifyDbError("bad auth : authentication failed"), "authentication");
  });

  test("17. describeSelectionCauses exposes only names/codes, never values", () => {
    const fabricated = {
      name: "MongoServerSelectionError",
      reason: {
        serverDescriptions: new Map([
          ["a:27017", { error: { name: "MongoNetworkTimeoutError", message: "connection timed out at hidden-host:27017" } }],
          ["b:27017", { error: { name: "MongoServerError", code: 18, message: "auth fails for secret-user" } }],
          ["c:27017", {}],
        ]),
      },
    };
    const causes = connectDB.describeSelectionCauses(fabricated);
    assert.deepEqual(causes.sort(), ["MongoNetworkTimeoutError", "MongoServerError#18"].sort());
    assert.ok(!JSON.stringify(causes).includes("hidden-host"));
    assert.ok(!JSON.stringify(causes).includes("secret-user"));
    assert.deepEqual(connectDB.describeSelectionCauses({}), []);
    assert.deepEqual(connectDB.describeSelectionCauses(null), []);
  });

  test("18. withRequestDb serializes holders: concurrent use fails fast busy", async () => {
    let releaseGate;
    const gate = new Promise((resolve) => {
      releaseGate = resolve;
    });
    connectDB.ensureDbConnected = () => gate.then(() => mongoose);
    const holder = connectDB.withRequestDb({}, async () => {
      await gate;
      return "held";
    });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(connectDB.isDbRequestInUse(), true);
    await assert.rejects(connectDB.withRequestDb({}, async () => "never"), (err) => {
      assert.equal(err.status, 503);
      assert.equal(err.code, "DB_BUSY");
      return true;
    });
    releaseGate();
    assert.equal(await holder, "held");
    assert.equal(connectDB.isDbRequestInUse(), false);
  });

  test("19. withRequestDb runs, then releases and disconnects", async () => {
    connectDB.ensureDbConnected = async () => mongoose;
    let ran = false;
    const out = await connectDB.withRequestDb({}, async () => {
      ran = true;
      assert.equal(connectDB.isDbRequestInUse(), true);
      return 42;
    });
    assert.equal(out, 42);
    assert.equal(ran, true);
    assert.equal(connectDB.isDbRequestInUse(), false);
    assert.equal(connectDB.isDbConnected(), false);
  });

  test("20. withRequestDb propagates acquisition failure and releases", async () => {
    await assert.rejects(connectDB.withRequestDb({ env: {} }, async () => "never"), (err) => {
      assert.equal(err.status, 503);
      return true;
    });
    assert.equal(connectDB.isDbRequestInUse(), false);
  });

  test("21. Login rejects missing credentials with 400 before any lookup", async () => {
    connectDB.ensureDbConnected = async () => mongoose;
    process.env.JWT_SECRET = "phase8_login_required_secret";
    let lookedUp = false;
    Students.findOne = async () => {
      lookedUp = true;
      return null;
    };
    for (const body of [undefined, {}]) {
      const init = { method: "POST", headers: {} };
      if (body !== undefined) {
        init.headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }
      const res = await app.fetch(new Request("http://localhost/api/v1/login", init), {
        NODE_ENV: "test",
        JWT_SECRET: "phase8_login_required_secret",
      });
      assert.equal(res.status, 400);
      assert.match((await res.json()).message, /required/i);
    }
    assert.equal(lookedUp, false, "no database lookup may run without credentials");
  });
});
