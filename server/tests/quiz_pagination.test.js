const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const honoApp = require("../honoApp");
const connectDB = require("../db/db");
const { encodeQuizCursor, decodeQuizCursor } = require("../honoApp");
const Quiz = require("../models/quizModels");

describe("Task 1: Robust Cursor-Based Quiz Event Pagination & Frontend Synchronization", () => {
  // Phase 8: database gating lives in Hono middleware (covered by the Phase 8
  // suite). These handler tests simulate a connected isolate so they verify
  // pagination, validation, and sanitization logic behind a healthy database.
  connectDB.ensureDbConnected = () => connectDB.mongoose;
  const TEST_JWT_SECRET = "test_pagination_jwt_secret_98765";
  const mockInstitutionAlpha = new mongoose.Types.ObjectId().toString();
  const mockInstitutionBeta = new mongoose.Types.ObjectId().toString();
  const studentAlphaId = new mongoose.Types.ObjectId().toString();

  const studentAlphaToken = jwt.sign(
    {
      userId: studentAlphaId,
      role: "student",
      institutionId: mockInstitutionAlpha,
      email: "alpha_student@edumatrix.edu",
    },
    TEST_JWT_SECRET
  );

  const studentBetaToken = jwt.sign(
    {
      userId: new mongoose.Types.ObjectId().toString(),
      role: "student",
      institutionId: mockInstitutionBeta,
      email: "beta_student@edumatrix.edu",
    },
    TEST_JWT_SECRET
  );

  let originalFind;

  beforeEach(() => {
    originalFind = Quiz.find;
  });

  afterEach(() => {
    Quiz.find = originalFind;
  });

  // ── Helper to build synthetic in-memory quiz fixture with query engine ─────
  function setupQuizInMemoryStore(dataset) {
    Quiz.find = function (query) {
      const cloned = dataset.map((d) => ({ ...d }));

      function matchesCondition(doc, cond) {
        if (!cond || Object.keys(cond).length === 0) return true;

        if (cond.$and && Array.isArray(cond.$and)) {
          return cond.$and.every((sub) => matchesCondition(doc, sub));
        }

        if (cond.$or && Array.isArray(cond.$or)) {
          return cond.$or.some((sub) => matchesCondition(doc, sub));
        }

        for (const [key, val] of Object.entries(cond)) {
          if (key === "$or" || key === "$and") continue;

          if (key === "institutionId") {
            if (val && typeof val === "object") {
              if (val.$exists === false && doc.institutionId !== undefined) return false;
            } else if (val === null) {
              if (doc.institutionId !== null && doc.institutionId !== undefined) return false;
            } else {
              if (String(doc.institutionId) !== String(val)) return false;
            }
          } else if (key === "createdAt") {
            const docTime = new Date(doc.createdAt).getTime();
            if (val && typeof val === "object" && val.$gt) {
              const gtTime = new Date(val.$gt).getTime();
              if (!(docTime > gtTime)) return false;
            }
          } else if (key === "_id") {
            if (val && typeof val === "object" && val.$gt) {
              const targetId = String(val.$gt);
              const docId = String(doc._id);
              if (!(docId > targetId)) return false;
            } else if (String(doc._id) !== String(val)) {
              return false;
            }
          }
        }
        return true;
      }

      let filtered = cloned.filter((doc) => matchesCondition(doc, query));

      const queryObj = {
        _sort: null,
        _limit: null,
        sort(sortObj) {
          this._sort = sortObj;
          return this;
        },
        limit(n) {
          this._limit = n;
          return this;
        },
        lean() {
          if (this._sort) {
            filtered.sort((a, b) => {
              const timeA = new Date(a.createdAt).getTime();
              const timeB = new Date(b.createdAt).getTime();
              if (timeA !== timeB) return timeA - timeB;
              const idA = String(a._id);
              const idB = String(b._id);
              return idA.localeCompare(idB);
            });
          }
          if (typeof this._limit === "number") {
            filtered = filtered.slice(0, this._limit);
          }
          return filtered;
        },
      };

      return queryObj;
    };
  }

  // ── 1. Unit: encodeQuizCursor and decodeQuizCursor ────────────────────────
  test("1. Cursor Encoding & Decoding: Valid cursor round-trips correctly", () => {
    const testDate = new Date("2026-03-15T10:00:00.000Z");
    const testId = new mongoose.Types.ObjectId().toString();

    const cursorStr = encodeQuizCursor(testDate, testId);
    assert.ok(typeof cursorStr === "string");
    assert.ok(!cursorStr.includes("+"), "base64url should not contain +");
    assert.ok(!cursorStr.includes("/"), "base64url should not contain /");

    const decoded = decodeQuizCursor(cursorStr);
    assert.ok(decoded !== null);
    assert.equal(decoded.t, testDate.getTime());
    assert.equal(decoded.id, testId);
  });

  test("2. Cursor Validation: Malformed, tampered, and invalid cursors return null", () => {
    assert.equal(decodeQuizCursor(""), null);
    assert.equal(decodeQuizCursor("   "), null);
    assert.equal(decodeQuizCursor(null), null);
    assert.equal(decodeQuizCursor(undefined), null);
    assert.equal(decodeQuizCursor("not-base64!@#$"), null);

    // Valid base64url but invalid JSON
    const badJson = Buffer.from("just a plain string", "utf8").toString("base64url");
    assert.equal(decodeQuizCursor(badJson), null);

    // JSON missing id
    const missingId = Buffer.from(JSON.stringify({ t: 1700000000000 }), "utf8").toString("base64url");
    assert.equal(decodeQuizCursor(missingId), null);

    // JSON with non-hex ID (SQL/NoSQL injection attempt or tampering)
    const badHexId = Buffer.from(
      JSON.stringify({ t: 1700000000000, id: "{$gt: ''}" }),
      "utf8"
    ).toString("base64url");
    assert.equal(decodeQuizCursor(badHexId), null);

    // JSON with invalid timestamp
    const badTime = Buffer.from(
      JSON.stringify({ t: -100, id: new mongoose.Types.ObjectId().toString() }),
      "utf8"
    ).toString("base64url");
    assert.equal(decodeQuizCursor(badTime), null);
  });

  // ── 2. Parameter Validation & Error Contracts ─────────────────────────────
  test("3. Parameter Conflict: Passing both 'since' and 'cursor' returns HTTP 400", async () => {
    const validCursor = encodeQuizCursor(new Date(), new mongoose.Types.ObjectId().toString());
    const req = new Request(
      `http://localhost/api/quizzes/events?since=1000&cursor=${encodeURIComponent(validCursor)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${studentAlphaToken}` },
      }
    );
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Conflicting pagination parameters/i);
  });

  test("4. Invalid Cursor: Tampered or invalid cursor parameter returns HTTP 400", async () => {
    const req = new Request("http://localhost/api/quizzes/events?cursor=malformed_tampered_cursor_xyz", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Invalid pagination cursor/i);
  });

  test("5. Invalid 'since': Malformed string returns HTTP 400", async () => {
    const req = new Request("http://localhost/api/quizzes/events?since=not-a-timestamp", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Invalid 'since' timestamp/i);
  });

  test("6. Invalid 'limit': Negative or non-integer limit returns HTTP 400", async () => {
    const req = new Request("http://localhost/api/quizzes/events?limit=-5", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /Invalid 'limit' parameter/i);
  });

  test("7. Auth Enforcement: Missing or invalid token returns HTTP 401", async () => {
    const req1 = new Request("http://localhost/api/quizzes/events", { method: "GET" });
    const res1 = await honoApp.fetch(req1, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res1.status, 401);

    const req2 = new Request("http://localhost/api/quizzes/events", {
      method: "GET",
      headers: { Authorization: "Bearer invalid_forged_token" },
    });
    const res2 = await honoApp.fetch(req2, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res2.status, 401);
  });

  // ── 3. High Volume Synthetic Dataset: 220 Quizzes with Timestamp Ties ─────
  test("8. Multi-Page Pagination: 220 quizzes with identical createdAt clusters page deterministically without skips or duplicates", async () => {
    // Generate 220 synthetic quizzes
    // 4 clusters of timestamps, 55 quizzes each (all sharing the exact same millisecond within the cluster)
    const baseTime = 1774000000000;
    const TOTAL_QUIZZES = 220;
    const syntheticQuizzes = [];

    for (let i = 0; i < TOTAL_QUIZZES; i++) {
      const clusterIdx = Math.floor(i / 55);
      const clusterTime = new Date(baseTime + clusterIdx * 60000); // 1 minute apart
      const objectId = new mongoose.Types.ObjectId();

      syntheticQuizzes.push({
        _id: objectId,
        title: `Synthetic Quiz ${i + 1}`,
        description: `Description for quiz ${i + 1}`,
        institutionId: mockInstitutionAlpha,
        createdAt: clusterTime,
        questions: [
          {
            _id: new mongoose.Types.ObjectId(),
            questionText: `Question for quiz ${i + 1}?`,
            options: ["A", "B", "C", "D"],
            correctAnswer: 2, // Must be stripped!
          },
        ],
      });
    }

    // Sort canonically by createdAt asc, _id asc
    syntheticQuizzes.sort((a, b) => {
      const timeDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (timeDiff !== 0) return timeDiff;
      return String(a._id).localeCompare(String(b._id));
    });

    setupQuizInMemoryStore(syntheticQuizzes);

    // Page through using limit = 50
    // Total pages expected: 5 pages (50, 50, 50, 50, 20)
    const collectedQuizzes = [];
    let currentCursor = null;
    let pageCount = 0;
    let hasMore = true;

    while (hasMore && pageCount < 10) {
      pageCount++;
      let url = "http://localhost/api/quizzes/events?limit=50";
      if (currentCursor) {
        url += `&cursor=${encodeURIComponent(currentCursor)}`;
      } else {
        url += "&since=0";
      }

      const req = new Request(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${studentAlphaToken}` },
      });
      const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
      assert.equal(res.status, 200);

      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.events));

      // Check sensitive field exclusion: correctAnswer must NOT exist
      for (const evt of body.events) {
        assert.ok(evt.data._id);
        assert.ok(Array.isArray(evt.data.questions));
        for (const q of evt.data.questions) {
          assert.equal(q.correctAnswer, undefined, "correctAnswer must be excluded");
        }
      }

      collectedQuizzes.push(...body.events.map((e) => e.data));

      hasMore = body.pagination.hasMore;
      if (hasMore) {
        assert.ok(body.pagination.nextCursor, "nextCursor must be present when hasMore is true");
        currentCursor = body.pagination.nextCursor;
      } else {
        assert.equal(body.pagination.nextCursor, null);
      }
    }

    assert.equal(pageCount, 5, "Expected exactly 5 pages for 220 records with limit 50");
    assert.equal(collectedQuizzes.length, TOTAL_QUIZZES, "All 220 synthetic quizzes must be retrieved");

    // Verify zero duplicates and zero skipped records
    const collectedIds = new Set();
    for (let i = 0; i < collectedQuizzes.length; i++) {
      const id = String(collectedQuizzes[i]._id);
      assert.equal(collectedIds.has(id), false, `Duplicate record found at index ${i}: ${id}`);
      collectedIds.add(id);

      // Verify exact matching with canonical synthetic dataset
      assert.equal(id, String(syntheticQuizzes[i]._id), `Record order mismatch at position ${i}`);
    }
  });

  // ── 4. Institution Scoping Across Pages ───────────────────────────────────
  test("9. Institution Isolation: Student cannot observe other institutions' quiz events across pages", async () => {
    const alphaQuiz = {
      _id: new mongoose.Types.ObjectId(),
      title: "Alpha Institution Quiz",
      description: "Alpha only",
      institutionId: mockInstitutionAlpha,
      createdAt: new Date("2026-03-01T10:00:00.000Z"),
      questions: [],
    };
    const betaQuiz = {
      _id: new mongoose.Types.ObjectId(),
      title: "Beta Institution Quiz",
      description: "Beta only",
      institutionId: mockInstitutionBeta,
      createdAt: new Date("2026-03-01T10:00:01.000Z"),
      questions: [],
    };

    setupQuizInMemoryStore([alphaQuiz, betaQuiz]);

    // Student Alpha fetch
    const reqAlpha = new Request("http://localhost/api/quizzes/events?since=0", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const resAlpha = await honoApp.fetch(reqAlpha, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(resAlpha.status, 200);
    const bodyAlpha = await resAlpha.json();
    assert.equal(bodyAlpha.events.length, 1);
    assert.equal(bodyAlpha.events[0].data.title, "Alpha Institution Quiz");

    // Student Beta fetch
    const reqBeta = new Request("http://localhost/api/quizzes/events?since=0", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentBetaToken}` },
    });
    const resBeta = await honoApp.fetch(reqBeta, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(resBeta.status, 200);
    const bodyBeta = await resBeta.json();
    assert.equal(bodyBeta.events.length, 1);
    assert.equal(bodyBeta.events[0].data.title, "Beta Institution Quiz");
  });

  // ── 5. Empty Result Set Behavior ──────────────────────────────────────────
  test("10. Empty Results: Returns count 0, hasMore false, and nextCursor null", async () => {
    setupQuizInMemoryStore([]);

    const req = new Request("http://localhost/api/quizzes/events?since=0", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.count, 0);
    assert.equal(body.events.length, 0);
    assert.equal(body.pagination.hasMore, false);
    assert.equal(body.pagination.nextCursor, null);
  });

  // ── 6. Database Error Sanitization ────────────────────────────────────────
  test("11. Error Sanitization: Database errors return sanitized HTTP 500 response", async () => {
    Quiz.find = function () {
      throw new Error("mongodb+srv://admin:superSecretPass123@cluster0.abc.mongodb.net: Connection failure");
    };

    const req = new Request("http://localhost/api/quizzes/events", {
      method: "GET",
      headers: { Authorization: `Bearer ${studentAlphaToken}` },
    });
    const res = await honoApp.fetch(req, { JWT_SECRET: TEST_JWT_SECRET });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error, "Failed to fetch quiz events");
    assert.ok(!JSON.stringify(body).includes("superSecretPass123"), "Secrets must never be leaked");
  });

  // ── 7. Frontend Synchronization Simulation ────────────────────────────────
  test("12. Frontend Sync Simulation: Deduplication, page cap continuation, and race condition resilience", async () => {
    // Simulate a full client-side state manager matching QuizList.jsx
    const seenQuizIds = new Set();
    const quizzes = [];
    let lastProcessedCursor = null;
    let continuationCursor = null;
    let isSyncing = false;
    const MAX_PAGES_PER_SYNC = 3; // simulated small cap to test continuation

    // Mock API returning 5 pages (10 records each = 50 records)
    const allMockRecords = [];
    for (let i = 0; i < 50; i++) {
      allMockRecords.push({
        _id: new mongoose.Types.ObjectId().toString(),
        title: `Client Mock Quiz ${i + 1}`,
        createdAt: new Date(1774000000000 + i * 1000).toISOString(),
      });
    }

    function mockApiGetEvents(cursor, limit = 10) {
      let startIndex = 0;
      if (cursor) {
        const decoded = decodeQuizCursor(cursor);
        startIndex = allMockRecords.findIndex((r) => String(r._id) === decoded.id) + 1;
      }
      const slice = allMockRecords.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < allMockRecords.length;
      const nextRecord = hasMore && slice.length > 0 ? slice[slice.length - 1] : null;
      const nextCursor = nextRecord ? encodeQuizCursor(nextRecord.createdAt, nextRecord._id) : null;

      return {
        data: {
          success: true,
          events: slice.map((s) => ({
            eventId: `quiz_${s._id}`,
            eventType: "new-quiz",
            data: s,
          })),
          pagination: { hasMore, nextCursor, limit },
          serverTime: Date.now(),
        },
      };
    }

    async function syncQuizEvents() {
      if (isSyncing) return;
      isSyncing = true;
      try {
        let pageCount = 0;
        let hasMore = true;
        let currentCursor = continuationCursor || lastProcessedCursor;

        while (hasMore && pageCount < MAX_PAGES_PER_SYNC) {
          pageCount++;
          const res = await mockApiGetEvents(currentCursor, 10);
          const { events, pagination } = res.data;

          const newEvents = events.filter((evt) => !seenQuizIds.has(String(evt.data._id)));
          newEvents.forEach((evt) => seenQuizIds.add(String(evt.data._id)));
          quizzes.push(...newEvents.map((evt) => evt.data));

          hasMore = Boolean(pagination?.hasMore && pagination?.nextCursor);
          if (pagination?.nextCursor) {
            currentCursor = pagination.nextCursor;
            lastProcessedCursor = pagination.nextCursor;
          } else {
            break;
          }
        }

        if (hasMore && currentCursor) {
          continuationCursor = currentCursor;
        } else {
          continuationCursor = null;
        }
      } finally {
        isSyncing = false;
      }
    }

    // Step A: First sync run (hits MAX_PAGES_PER_SYNC = 3, so 30 records ingested)
    await syncQuizEvents();
    assert.equal(quizzes.length, 30);
    assert.ok(continuationCursor !== null, "continuationCursor must be saved when page cap is reached");

    // Step B: Live event arrives concurrently during idle / reconnect
    // A live new-quiz event arrives with quiz record 35 (ahead of current catch-up)
    const liveRecord = allMockRecords[34];
    if (!seenQuizIds.has(String(liveRecord._id))) {
      seenQuizIds.add(String(liveRecord._id));
      quizzes.push(liveRecord);
    }
    assert.equal(quizzes.length, 31);
    assert.ok(seenQuizIds.has(String(liveRecord._id)));

    // Step C: Second sync run (resumes from continuationCursor, fetches remaining 20 records)
    await syncQuizEvents();
    // Total records should be exactly 50 (30 from first sync + 1 live + 19 remaining, zero duplicate for live quiz 35)
    assert.equal(quizzes.length, 50);
    assert.equal(seenQuizIds.size, 50);
    assert.equal(continuationCursor, null, "continuationCursor must be cleared when all pages are consumed");

    // Step D: Concurrent sync guard prevents double invocation
    isSyncing = true;
    const initialLen = quizzes.length;
    await syncQuizEvents(); // Should bail out immediately
    assert.equal(quizzes.length, initialLen);
    isSyncing = false;
  });
});
