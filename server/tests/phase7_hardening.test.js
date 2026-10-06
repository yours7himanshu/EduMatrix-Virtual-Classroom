/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const test = require("node:test");
const assert = require("node:assert");
const EventEmitter = require("node:events");
const { createRateLimiter } = require("../middlewares/rateLimiter");
const socketService = require("../middlewares/socketService");
const { generateLiveToken } = require("../controllers/liveController");

function createMockReqRes(options = {}) {
  const req = {
    ip: options.ip || "127.0.0.1",
    headers: options.headers || {},
    user: options.user || null,
    body: options.body || {},
    socket: { remoteAddress: options.ip || "127.0.0.1" },
  };

  const headers = {};
  const res = {
    statusCode: 200,
    data: null,
    setHeader(name, val) {
      headers[name.toLowerCase()] = val;
    },
    getHeader(name) {
      return headers[name.toLowerCase()];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };

  return { req, res, headers };
}

test("Phase 7: Production Hardening & Legacy WebRTC Retirement Suite", async (t) => {
  await t.test("Rate Limiter: permits requests under limit and returns 429 when exceeded", () => {
    const limiter = createRateLimiter({
      windowMs: 5000,
      max: 3,
      message: "Rate limit exceeded",
    });

    let nextCalled = 0;
    const next = () => {
      nextCalled += 1;
    };

    // Request 1: Allowed
    const { req: req1, res: res1 } = createMockReqRes({ ip: "192.168.1.100" });
    limiter(req1, res1, next);
    assert.strictEqual(nextCalled, 1);
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.getHeader("x-ratelimit-remaining"), 2);

    // Request 2: Allowed
    const { req: req2, res: res2 } = createMockReqRes({ ip: "192.168.1.100" });
    limiter(req2, res2, next);
    assert.strictEqual(nextCalled, 2);
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.getHeader("x-ratelimit-remaining"), 1);

    // Request 3: Allowed (at limit)
    const { req: req3, res: res3 } = createMockReqRes({ ip: "192.168.1.100" });
    limiter(req3, res3, next);
    assert.strictEqual(nextCalled, 3);
    assert.strictEqual(res3.statusCode, 200);
    assert.strictEqual(res3.getHeader("x-ratelimit-remaining"), 0);

    // Request 4: Exceeded (429)
    const { req: req4, res: res4 } = createMockReqRes({ ip: "192.168.1.100" });
    limiter(req4, res4, next);
    assert.strictEqual(nextCalled, 3); // next() should NOT be called
    assert.strictEqual(res4.statusCode, 429);
    assert.strictEqual(res4.data.success, false);
    assert.strictEqual(res4.data.message, "Rate limit exceeded");
    assert.ok(typeof res4.data.retryAfterSeconds === "number");
    assert.ok(res4.data.retryAfterSeconds > 0);

    // Different IP is NOT affected
    const { req: reqOther, res: resOther } = createMockReqRes({ ip: "192.168.1.101" });
    limiter(reqOther, resOther, next);
    assert.strictEqual(nextCalled, 4);
    assert.strictEqual(resOther.statusCode, 200);
  });

  await t.test("Rate Limiter: resets correctly when reset() is called", () => {
    const limiter = createRateLimiter({
      windowMs: 5000,
      max: 1,
    });

    let nextCalled = 0;
    const next = () => {
      nextCalled += 1;
    };

    const { req: req1, res: res1 } = createMockReqRes({ ip: "10.0.0.1" });
    limiter(req1, res1, next);
    assert.strictEqual(nextCalled, 1);

    // Exceeded
    const { req: req2, res: res2 } = createMockReqRes({ ip: "10.0.0.1" });
    limiter(req2, res2, next);
    assert.strictEqual(res2.statusCode, 429);

    // Reset
    limiter.reset();

    // Now allowed again
    const { req: req3, res: res3 } = createMockReqRes({ ip: "10.0.0.1" });
    limiter(req3, res3, next);
    assert.strictEqual(nextCalled, 2);
    assert.strictEqual(res3.statusCode, 200);
  });

  await t.test("Security: LiveKit token controller never leaks secrets in errors or responses", async () => {
    const originalSecret = process.env.LIVEKIT_API_SECRET;
    const originalKey = process.env.LIVEKIT_API_KEY;
    const originalNodeEnv = process.env.NODE_ENV;

    const SECRET_CANARY = "super_secret_canary_key_livekit_999";
    process.env.LIVEKIT_API_KEY = "test_key";
    process.env.LIVEKIT_API_SECRET = SECRET_CANARY;

    try {
      // 1. Missing classroomId triggers 400 without leaking secrets
      const { req: req1, res: res1 } = createMockReqRes({
        user: { id: "65f000000000000000000001", role: "teacher" },
        body: {},
      });
      await generateLiveToken(req1, res1);
      assert.strictEqual(res1.statusCode, 400);
      assert.strictEqual(JSON.stringify(res1.data).includes(SECRET_CANARY), false);

      // 2. Production mode suppresses raw error messages in 500 responses
      process.env.NODE_ENV = "production";
      const Classroom = require("../models/classroomModel");
      const originalFindById = Classroom.findById;
      Classroom.findById = () => {
        throw new Error("Simulated database failure");
      };

      try {
        const { req: req2, res: res2 } = createMockReqRes({
          user: { id: "65f000000000000000000001", role: "teacher" },
          body: { classroomId: "65f000000000000000000002" },
        });
        await generateLiveToken(req2, res2);
        assert.strictEqual(res2.statusCode, 500);
        assert.strictEqual(res2.data.error, undefined);
        assert.strictEqual(JSON.stringify(res2.data).includes(SECRET_CANARY), false);
      } finally {
        Classroom.findById = originalFindById;
      }
    } finally {
      process.env.LIVEKIT_API_SECRET = originalSecret;
      process.env.LIVEKIT_API_KEY = originalKey;
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  await t.test("Socket.IO: Legacy WebRTC signaling events are completely absent", () => {
    // Mock Socket.IO server and socket
    const mockIo = new EventEmitter();
    const registeredSocketEvents = new Set();

    const mockSocket = new EventEmitter();
    const originalOn = mockSocket.on.bind(mockSocket);
    mockSocket.on = function (event, handler) {
      registeredSocketEvents.add(event);
      return originalOn(event, handler);
    };
    mockSocket.id = "mock_socket_phase7";
    mockSocket.handshake = {
      headers: {},
      auth: {},
      query: {},
    };

    socketService(mockIo);
    mockIo.emit("connection", mockSocket);

    // Verify Chat event IS registered
    assert.ok(registeredSocketEvents.has("sendMessage"), "sendMessage event must be registered for chat");
    assert.ok(registeredSocketEvents.has("disconnect"), "disconnect event must be registered");

    // Verify Legacy WebRTC events are NOT registered
    const legacyEvents = [
      "join-room",
      "leave-room",
      "call-user",
      "call-accepted",
      "ice-candidate",
      "renegotiate",
    ];

    for (const legacyEvent of legacyEvents) {
      assert.strictEqual(
        registeredSocketEvents.has(legacyEvent),
        false,
        `Legacy WebRTC event '${legacyEvent}' must NOT be registered on socket`
      );
    }
  });
});
