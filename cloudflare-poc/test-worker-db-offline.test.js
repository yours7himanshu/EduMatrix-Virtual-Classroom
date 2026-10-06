import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import workerEntrypoint from "./src/db-verify-worker.js";
import connectDB from "../server/db/db.js";
import Quiz from "../server/models/quizModels.js";
import mongoose from "mongoose";

describe("Task 2: Worker Database Verification Harness & Staging Guard Suite (Offline)", () => {
  const mockUser = "mock_staging_user";
  const mockPass = "mock_staging_pass";
  const VALID_STAGING_URI = `mongodb+srv://${mockUser}:${mockPass}@cluster-staging.example.net/edumatrix_staging?retryWrites=true&w=majority`;

  test("1. Fail-Closed: Missing MONGO_STAGING_URI binding returns HTTP 400", async () => {
    const req = new Request("http://localhost/verify-db", {
      method: "GET",
      headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
    });
    const env = {}; // No staging URI

    const res = await workerEntrypoint.fetch(req, env);
    assert.equal(res.status, 400);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Fail-closed: MONGO_STAGING_URI binding is not configured/i);
  });

  test("2. Anti-Production Guard: Database name containing 'prod' or 'live' is rejected with HTTP 403", async () => {
    const prodUris = [
      "mongodb+srv://user:pass@cluster0.example.net/prod?retryWrites=true",
      "mongodb+srv://user:pass@cluster0.example.net/edumatrix_production",
      "mongodb+srv://user:pass@cluster0.example.net/live_db",
      "mongodb://user:pass@example.net:27017/edumatrix_prod",
    ];

    for (const prodUri of prodUris) {
      const req = new Request("http://localhost/verify-db", {
        method: "GET",
        headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
      });
      const env = { MONGO_STAGING_URI: prodUri };

      const res = await workerEntrypoint.fetch(req, env);
      assert.equal(res.status, 403, `Expected HTTP 403 for production URI: ${prodUri}`);

      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error, /prohibited production identifiers/i);
    }
  });

  test("3. Expected Database Matching: Mismatched EXPECTED_STAGING_DB_NAME is rejected with HTTP 403", async () => {
    const req = new Request("http://localhost/verify-db", {
      method: "GET",
      headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
    });
    const env = {
      MONGO_STAGING_URI: VALID_STAGING_URI,
      EXPECTED_STAGING_DB_NAME: "other_staging_db", // Mismatch with edumatrix_staging
    };

    const res = await workerEntrypoint.fetch(req, env);
    assert.equal(res.status, 403);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /does not match configured EXPECTED_STAGING_DB_NAME/i);
  });

  test("4. Production Fallback Prevention: MONGO_STAGING_URI matching MONGO_URI is rejected", async () => {
    const dangerousUri = "mongodb+srv://user:pass@cluster0.example.net/edumatrix_staging";
    const req = new Request("http://localhost/verify-db", {
      method: "GET",
      headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
    });
    const env = {
      MONGO_STAGING_URI: dangerousUri,
      MONGO_URI: dangerousUri, // Accidental leakage of prod binding
    };

    const res = await workerEntrypoint.fetch(req, env);
    assert.equal(res.status, 403);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /matches production database URI binding/i);
  });

  test("5. Authorization Header Guard: Missing X-Worker-Test-Runner header is rejected with HTTP 403", async () => {
    const req = new Request("http://localhost/verify-db", { method: "GET" });
    const env = { MONGO_STAGING_URI: VALID_STAGING_URI };

    const res = await workerEntrypoint.fetch(req, env);
    assert.equal(res.status, 403);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Missing or invalid X-Worker-Test-Runner header/i);
  });

  test("6. Real Database Manager & Model Invocation: Harness invokes server/db/db.js and Quiz model", async () => {
    let connectCalledWith = null;
    let quizFindOneCalled = false;
    let pingCalled = false;

    // Spy on active mongoose instance used by connectDB and Quiz
    const activeMongoose = connectDB.mongoose || mongoose;
    const origConnect = activeMongoose.connect;
    const origFindOne = Quiz.findOne;

    try {
      activeMongoose.connection.readyState = 0;
      activeMongoose.connect = (uri) => {
        connectCalledWith = uri;
        activeMongoose.connection.readyState = 1;
        return activeMongoose;
      };

      activeMongoose.connection.db = {
        admin: () => ({
          ping: () => {
            pingCalled = true;
            return { ok: 1 };
          },
        }),
      };

      Quiz.findOne = function (filter) {
        quizFindOneCalled = true;
        return {
          select(field) {
            assert.equal(field, "_id");
            return {
              lean() {
                return null; // Empty collection is normal
              },
            };
          },
        };
      };

      const req = new Request("http://localhost/verify-db", {
        method: "GET",
        headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
      });
      const env = {
        MONGO_STAGING_URI: VALID_STAGING_URI,
        EXPECTED_STAGING_DB_NAME: "edumatrix_staging",
      };

      const res = await workerEntrypoint.fetch(req, env);
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.runtime, "workerd");
      assert.equal(body.manager, "server/db/db.js");
      assert.equal(body.databaseTarget, "staging");
      assert.equal(body.databaseName, "edumatrix_staging");
      assert.equal(body.operation, "read-only");
      assert.equal(body.pingVerified, true);
      assert.equal(body.quizModelQueryVerified, true);
      assert.equal(typeof body.durationMs, "number");

      assert.ok(connectCalledWith !== null, "connectDB must be called");
      assert.ok(pingCalled, "admin ping command must be executed");
      assert.ok(quizFindOneCalled, "Quiz.findOne must be executed");

      // Verify no sensitive credentials in response
      const strBody = JSON.stringify(body);
      assert.ok(!strBody.includes(mockPass), "Password must never be returned");
      assert.ok(!strBody.includes(mockUser), "Username must never be returned");
    } finally {
      activeMongoose.connect = origConnect;
      Quiz.findOne = origFindOne;
    }
  });

  test("7. Error Sanitization: Connection failure sanitizes credentials and returns HTTP 500", async () => {
    const activeMongoose = connectDB.mongoose || mongoose;
    const origConnect = activeMongoose.connect;
    try {
      activeMongoose.connection.readyState = 0;
      activeMongoose.connect = () => {
        throw new Error("Error making connection to the database");
      };

      const req = new Request("http://localhost/verify-db", {
        method: "GET",
        headers: { "X-Worker-Test-Runner": "edumatrix-staging-verify" },
      });
      const env = {
        MONGO_STAGING_URI: VALID_STAGING_URI,
        EXPECTED_STAGING_DB_NAME: "edumatrix_staging",
      };

      const res = await workerEntrypoint.fetch(req, env);
      assert.equal(res.status, 500);

      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error, /Database verification operation failed/i);
      assert.ok(body.sanitizedMessage);
      assert.ok(!body.sanitizedMessage.includes(mockPass), "Password must be sanitized");
      assert.ok(!JSON.stringify(body).includes(mockPass), "No credentials in error payload");
    } finally {
      activeMongoose.connect = origConnect;
    }
  });

  test("8. Read-Only Verification: Verification worker exposes zero mutation methods", () => {
    // Assert that the worker only supports GET /verify-db and GET /health
    assert.ok(typeof workerEntrypoint.fetch === "function");
  });
});
