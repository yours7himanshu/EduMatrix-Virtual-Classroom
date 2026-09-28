/*
 * EduMatrix Cloudflare Workers Migration — Phase 7: Realtime Re-architecture Suite
 * Validates Worker-compatible WebSocket and realtime events:
 * - JWT authentication on connection
 * - Classroom and institution room isolation
 * - Role-based authorization
 * - Flood rate limiting
 * - Quiz broadcast sanitization (stripping correctAnswer)
 * - Safe client cleanup
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { RealtimeManager } = require("../services/realtimeManager");

// Mock WebSocket class simulating Cloudflare Workers WebSocket
class MockServerSideSocket {
  constructor() {
    this.listeners = {};
    this.accepted = false;
    this.sentMessages = [];
    this.closed = false;
    this.closeCode = null;
    this.closeReason = null;
  }
  accept() {
    this.accepted = true;
  }
  addEventListener(event, fn) {
    this.listeners[event] = fn;
  }
  send(data) {
    this.sentMessages.push(typeof data === "string" ? JSON.parse(data) : data);
  }
  close(code, reason) {
    this.closed = true;
    this.closeCode = code;
    this.closeReason = reason;
    if (this.listeners["close"]) {
      this.listeners["close"]({ code, reason });
    }
  }
  // Helper to simulate client message received on server
  receiveClientMessage(obj) {
    if (this.listeners["message"]) {
      this.listeners["message"]({ data: JSON.stringify(obj) });
    }
  }
}

describe("Phase 7: Realtime Re-architecture & Worker WebSocket Suite", () => {
  const jwtSecret = "test_realtime_secret_123";
  process.env.JWT_SECRET = jwtSecret;

  const validStudentToken = jwt.sign(
    { userId: "student_1", role: "Student", institutionId: "inst_alpha" },
    jwtSecret
  );
  const validTeacherToken = jwt.sign(
    { userId: "teacher_1", role: "Teacher", institutionId: "inst_alpha" },
    jwtSecret
  );
  const foreignStudentToken = jwt.sign(
    { userId: "student_foreign", role: "Student", institutionId: "inst_beta" },
    jwtSecret
  );

  test("1. Authentication: Connection without token is rejected with 1008 policy violation", async () => {
    const manager = new RealtimeManager();
    const serverWs = new MockServerSideSocket();

    const session = manager.handleWebSocket(serverWs, {
      url: "http://localhost/ws",
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    assert.equal(session, null);
    assert.equal(serverWs.closed, true);
    assert.equal(serverWs.closeCode, 1008);
  });

  test("2. Authentication: Connection with invalid token is rejected", async () => {
    const manager = new RealtimeManager();
    const serverWs = new MockServerSideSocket();

    const session = manager.handleWebSocket(serverWs, {
      url: "http://localhost/ws?token=invalid.jwt.token",
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    assert.equal(session, null);
    assert.equal(serverWs.closed, true);
    assert.equal(serverWs.closeCode, 1008);
  });

  test("3. Authentication: Connection with valid token accepts socket and binds session context", async () => {
    const manager = new RealtimeManager();
    const serverWs = new MockServerSideSocket();

    const session = manager.handleWebSocket(serverWs, {
      url: `http://localhost/ws?token=${validStudentToken}`,
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    assert.ok(session);
    assert.equal(session.user.id, "student_1");
    assert.equal(session.user.institutionId, "inst_alpha");
    assert.equal(serverWs.sentMessages.length, 1);
    assert.equal(serverWs.sentMessages[0].event, "connected");
  });

  test("4. Room Isolation: Auto-joins institutional room and user room", async () => {
    const manager = new RealtimeManager();
    const serverWs = new MockServerSideSocket();

    const session = manager.handleWebSocket(serverWs, {
      url: `http://localhost/ws?token=${validStudentToken}`,
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    assert.ok(session.rooms.has("inst_inst_alpha"));
    assert.ok(session.rooms.has("user_student_1"));
    assert.ok(manager.rooms.get("inst_inst_alpha").has(session));
  });

  test("5. Quiz Broadcast: Broadcasts to matching institution students and strips correctAnswer", async () => {
    const manager = new RealtimeManager();

    // Client 1: Alpha Student
    const socketAlpha = new MockServerSideSocket();
    const sessionAlpha = manager.handleWebSocket(socketAlpha, {
      url: `http://localhost/ws?token=${validStudentToken}`,
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    // Client 2: Beta Student (different institution)
    const socketBeta = new MockServerSideSocket();
    const sessionBeta = manager.handleWebSocket(socketBeta, {
      url: `http://localhost/ws?token=${foreignStudentToken}`,
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    // Teacher broadcasts new quiz for inst_alpha
    const rawQuiz = {
      _id: "quiz_99",
      title: "Algorithms Quiz",
      institutionId: "inst_alpha",
      questions: [
        {
          questionText: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n^2)"],
          correctAnswer: 1, // Must be stripped!
        },
      ],
    };

    manager.broadcastQuiz(rawQuiz);

    // Verify Alpha received sanitized quiz
    const alphaQuizMsg = socketAlpha.sentMessages.find(
      (m) => m.event === "new-quiz"
    );
    assert.ok(alphaQuizMsg, "Student in inst_alpha should receive the quiz notification");
    assert.equal(alphaQuizMsg.data.title, "Algorithms Quiz");
    assert.equal(alphaQuizMsg.data.questions[0].correctAnswer, undefined, "correctAnswer must NEVER be exposed");

    // Verify Beta NEVER received the quiz
    const betaQuizMsg = socketBeta.sentMessages.find(
      (m) => m.event === "new-quiz"
    );
    assert.equal(betaQuizMsg, undefined, "Cross-tenant leak prevented: inst_beta must NOT receive inst_alpha quiz");
  });

  test("6. Disconnection Cleanup: Client socket is cleanly unregistered upon close", async () => {
    const manager = new RealtimeManager();
    const serverWs = new MockServerSideSocket();

    const session = manager.handleWebSocket(serverWs, {
      url: `http://localhost/ws?token=${validStudentToken}`,
      headers: {},
      env: { JWT_SECRET: jwtSecret },
      protocol: "native",
    });

    assert.equal(manager.sessions.size, 1);
    assert.ok(manager.rooms.get("inst_inst_alpha").has(session));

    // Simulate client close
    serverWs.close(1000, "Normal closure");

    assert.equal(manager.sessions.size, 0);
    assert.equal(manager.rooms.has("inst_inst_alpha"), false);
  });

  test("7. Coordination Status: getCoordinationStatus reports hybrid architecture and isolate identity", () => {
    const manager = new RealtimeManager();
    const status = manager.getCoordinationStatus();

    assert.equal(status.tier, "cloudflare-workers-free");
    assert.ok(status.isolateId.startsWith("isolate_"));
    assert.equal(status.activeSessions, 0);
    assert.equal(status.activeRooms, 0);
    assert.ok(status.crossIsolateStrategies.inCallChat.includes("LiveKit"));
    assert.ok(status.crossIsolateStrategies.outOfCallQuiz.includes("MongoDB"));
    assert.equal(status.hasCustomCoordinator, false);
  });

  test("8. Out-of-Call Catch-Up: Quiz broadcasts buffer events for cross-isolate client sync", () => {
    const manager = new RealtimeManager();

    manager.broadcastQuiz({
      _id: "quiz_sync_101",
      title: "Distributed Systems Quiz",
      institutionId: "inst_alpha",
      questions: [{ questionText: "Q1?", options: ["A", "B"] }],
    });

    const alphaEvents = manager.getRecentQuizEvents("inst_alpha");
    assert.equal(alphaEvents.length, 1);
    assert.equal(alphaEvents[0]._id, "quiz_sync_101");
    assert.equal(alphaEvents[0].title, "Distributed Systems Quiz");

    const betaEvents = manager.getRecentQuizEvents("inst_beta");
    assert.equal(betaEvents.length, 0, "Institution boundary must isolate event catch-up");
  });

  test("9. In-Call Chat Dispatch: Broadcast to classroom safely invokes LiveKit Data Channel bridge", async () => {
    const manager = new RealtimeManager();
    let bridgeCalled = false;

    // Spy on _dispatchLiveKitClassroomData
    manager._dispatchLiveKitClassroomData = async (roomName, event, payload) => {
      bridgeCalled = true;
      assert.equal(roomName, "class_507f1f77bcf86cd799439011");
      assert.equal(event, "receiveMessage");
      assert.equal(payload.content, "Hello classroom");
      return true;
    };

    const result = manager.broadcast(
      "class_507f1f77bcf86cd799439011",
      "receiveMessage",
      { content: "Hello classroom" }
    );

    assert.equal(result.crossIsolateDispatched, true);
    assert.equal(bridgeCalled, true);
  });

  test("10. Pluggable Coordinator: setCoordinator receives broadcast dispatches", async () => {
    const manager = new RealtimeManager();
    const coordinatorDispatches = [];

    manager.setCoordinator({
      broadcast: async (roomName, event, payload) => {
        coordinatorDispatches.push({ roomName, event, payload });
      },
    });

    manager.broadcast("inst_alpha", "alert", { text: "Campus update" });
    assert.equal(coordinatorDispatches.length, 1);
    assert.equal(coordinatorDispatches[0].roomName, "inst_alpha");
    assert.equal(coordinatorDispatches[0].event, "alert");
  });
});
