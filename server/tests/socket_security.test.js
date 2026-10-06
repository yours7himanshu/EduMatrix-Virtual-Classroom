process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123';

const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const socketService = require('../middlewares/socketService');
const Classroom = require('../models/classroomModel');
const Enrollment = require('../models/enrollmentModel');
const Message = require('../models/messageModel');
const { notifyClients, extractWsToken, clients: wsClients } = require('../websockets/notifyClients');
// Aliases used by Phase 3.1 test suite (appended below)
const notifyClientsFn = notifyClients;
const http = require('http');
const expressLib = require('express');
const cookieParserLib = require('cookie-parser');
const Quiz = require('../models/quizModels');
const quizRouter = require('../routes/quizessRoutes');


process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123';

/**
 * Creates a controllable mock Socket.IO server and socket harness.
 */
function createSocketHarness() {
  const middlewares = [];
  const connectionListeners = [];
  const roomBroadcasts = []; // [{ room, event, payload }]

  const mockIo = {
    use(fn) {
      middlewares.push(fn);
    },
    on(event, fn) {
      if (event === 'connection') {
        connectionListeners.push(fn);
      }
    },
    to(room) {
      return {
        emit(event, payload) {
          roomBroadcasts.push({ room, event, payload });
        },
      };
    },
    emit(event, payload) {
      roomBroadcasts.push({ room: 'GLOBAL', event, payload });
    },
  };

  function createMockSocket(options = {}) {
    const handlers = new Map();
    const emittedToSocket = [];
    const joinedRooms = new Set();

    const mockSocket = {
      id: options.id || `socket_${Math.random().toString(36).substring(7)}`,
      handshake: {
        headers: options.headers || {},
        auth: options.auth || {},
        query: options.query || {},
      },
      rooms: joinedRooms,
      join(room) {
        joinedRooms.add(room);
      },
      leave(room) {
        joinedRooms.delete(room);
      },
      emit(event, ...args) {
        emittedToSocket.push({ event, args });
      },
      to(room) {
        return {
          emit(event, payload) {
            roomBroadcasts.push({ room, event, payload, senderId: mockSocket.id });
          },
        };
      },
      broadcast: {
        emit(event, payload) {
          roomBroadcasts.push({ room: 'GLOBAL_BROADCAST', event, payload, senderId: mockSocket.id });
        },
      },
      on(event, handler) {
        handlers.set(event, handler);
      },
      // Test helpers
      async trigger(event, data, callback) {
        const handler = handlers.get(event);
        if (!handler) {
          throw new Error(`No handler registered for event '${event}'`);
        }
        return await handler(data, callback);
      },
      getEmitted(eventName) {
        return emittedToSocket.filter((e) => e.event === eventName).map((e) => e.args);
      },
      getLastEmitted(eventName) {
        const matching = this.getEmitted(eventName);
        return matching.length > 0 ? matching[matching.length - 1][0] : null;
      },
    };

    // Helper to simulate full connection lifecycle through middlewares
    async function connect() {
      let middlewareError = null;
      for (const middleware of middlewares) {
        await new Promise((resolve) => {
          middleware(mockSocket, (err) => {
            if (err) middlewareError = err;
            resolve();
          });
        });
        if (middlewareError) break;
      }

      if (middlewareError) {
        return { success: false, error: middlewareError };
      }

      for (const listener of connectionListeners) {
        listener(mockSocket);
      }
      return { success: true, socket: mockSocket };
    }

    return { socket: mockSocket, connect };
  }

  return { mockIo, createMockSocket, roomBroadcasts };
}

test('Socket.IO Security & Room-Level Authorization Suite (Phase 3)', async (t) => {
  // Shared fixtures
  const instId1 = new mongoose.Types.ObjectId().toString();
  const instId2 = new mongoose.Types.ObjectId().toString();

  const studentUser1 = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'student1@inst1.edu',
    name: 'Alice Johnson',
    role: 'student',
    institutionId: instId1,
  };

  const studentUser2 = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'student2@inst2.edu',
    name: 'Bob Smith',
    role: 'student',
    institutionId: instId2,
  };

  const teacherUser1 = {
    collegeId: new mongoose.Types.ObjectId().toString(),
    email: 'prof1@inst1.edu',
    name: 'Dr. Carol White',
    role: 'Teacher',
    institutionId: instId1,
  };

  const directorUser1 = {
    collegeId: new mongoose.Types.ObjectId().toString(),
    email: 'director@inst1.edu',
    name: 'Dr. David Director',
    role: 'Director',
    institutionId: instId1,
  };

  const studentToken1 = jwt.sign(studentUser1, process.env.JWT_SECRET, { expiresIn: '1h' });
  const studentToken2 = jwt.sign(studentUser2, process.env.JWT_SECRET, { expiresIn: '1h' });
  const teacherToken1 = jwt.sign(teacherUser1, process.env.JWT_SECRET, { expiresIn: '1h' });
  const directorToken1 = jwt.sign(directorUser1, process.env.JWT_SECRET, { expiresIn: '1h' });

  // SECTION 1: CONNECTION AUTHENTICATION
  await t.test('1. Anonymous connection is rejected at handshake level', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { connect } = harness.createMockSocket({ auth: {} });
    const result = await connect();

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.match(result.error.message, /Authentication error: Token required/);
  });

  await t.test('2. Invalid or expired JWT connection is rejected at handshake level', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    // Invalid signature
    const badToken = jwt.sign({ userId: '123' }, 'wrong_secret');
    const { connect: connectBad } = harness.createMockSocket({ auth: { token: badToken } });
    const resBad = await connectBad();
    assert.strictEqual(resBad.success, false);
    assert.match(resBad.error.message, /Authentication error: Invalid or expired token/);

    // Expired token
    const expiredToken = jwt.sign(studentUser1, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const { connect: connectExp } = harness.createMockSocket({ auth: { token: expiredToken } });
    const resExp = await connectExp();
    assert.strictEqual(resExp.success, false);
    assert.match(resExp.error.message, /Authentication error: Invalid or expired token/);
  });

  await t.test('3. Valid authenticated student accepted and auto-joins tenant & user rooms', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    const res = await connect();

    assert.strictEqual(res.success, true);
    assert.strictEqual(socket.user.id, studentUser1.userId);
    assert.strictEqual(socket.user.role, 'student');
    assert.strictEqual(socket.user.institutionId, instId1);
    assert.strictEqual(socket.user.name, 'Alice Johnson');

    // Auto-joined tenant and user rooms
    assert.ok(socket.rooms.has(`inst_${instId1}`), 'Must auto-join institutional room');
    assert.ok(socket.rooms.has(`user_${studentUser1.userId}`), 'Must auto-join private user room');
  });

  await t.test('4. Client-supplied identity or role cannot override verified token identity', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    // Client attempts to pass spoofed headers or auth
    const { socket, connect } = harness.createMockSocket({
      auth: { token: studentToken1, role: 'Director', userId: 'attacker_id', institutionId: 'fake_inst' },
      headers: { role: 'Director' },
    });
    const res = await connect();

    assert.strictEqual(res.success, true);
    assert.strictEqual(socket.user.role, 'student', 'Role must remain student as verified in token');
    assert.strictEqual(socket.user.id, studentUser1.userId, 'User ID must remain verified student ID');
    assert.strictEqual(socket.user.institutionId, instId1, 'Institution ID must remain verified institution');
    assert.strictEqual(socket.rooms.has('inst_fake_inst'), false, 'Cannot join spoofed institution room');
  });

  // SECTION 2: ROLE & CLASSROOM AUTHORIZATION
  await t.test('5. Student without active enrollment is rejected when joining classroom', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;
    const origFindOne = Enrollment.findOne;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1),
        teacherId: new mongoose.Types.ObjectId(teacherUser1.collegeId),
        isActive: true,
      });

      // Enrollment returns null (not enrolled)
      Enrollment.findOne = () => null;

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      const err = socket.getLastEmitted('roomError');
      assert.ok(err, 'Must emit roomError');
      assert.match(err.error, /Access denied: Unauthorized role or not enrolled in classroom/);
      assert.strictEqual(socket.rooms.has(`class_${testClassroomId}`), false, 'Socket must not join room');
      assert.strictEqual(callbackResult?.success, false);
    } finally {
      Classroom.findById = origFindById;
      Enrollment.findOne = origFindOne;
    }
  });

  await t.test('6. Student with active enrollment successfully joins classroom room', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;
    const origFindOne = Enrollment.findOne;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1),
        teacherId: new mongoose.Types.ObjectId(teacherUser1.collegeId),
        isActive: true,
      });

      // Active enrollment found
      Enrollment.findOne = () => ({
        classroomId: testClassroomId,
        studentId: studentUser1.userId,
        status: 'enrolled',
      });

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      assert.strictEqual(callbackResult?.success, true);
      assert.ok(socket.rooms.has(`class_${testClassroomId}`), 'Must successfully join classroom room');
      assert.strictEqual(socket.getLastEmitted('classroomJoined')?.classroomId, testClassroomId);
    } finally {
      Classroom.findById = origFindById;
      Enrollment.findOne = origFindOne;
    }
  });

  await t.test('7. Cross-institution access blocked: Student from Inst 2 cannot join Inst 1 classroom', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    // Student from Inst 2
    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken2 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1), // Belongs to Inst 1
        teacherId: new mongoose.Types.ObjectId(teacherUser1.collegeId),
        isActive: true,
      });

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      const err = socket.getLastEmitted('roomError');
      assert.ok(err);
      assert.match(err.error, /Institutional boundary violation/);
      assert.strictEqual(socket.rooms.has(`class_${testClassroomId}`), false);
      assert.strictEqual(callbackResult?.success, false);
    } finally {
      Classroom.findById = origFindById;
    }
  });

  await t.test('8. Teacher cannot join classroom they do not teach', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: teacherToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const otherTeacherId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1),
        teacherId: new mongoose.Types.ObjectId(otherTeacherId), // Different teacher
        isActive: true,
      });

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      const err = socket.getLastEmitted('roomError');
      assert.ok(err);
      assert.match(err.error, /Access denied: Unauthorized role or not enrolled/);
      assert.strictEqual(socket.rooms.has(`class_${testClassroomId}`), false);
    } finally {
      Classroom.findById = origFindById;
    }
  });

  await t.test('9. Assigned teacher can join their classroom', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: teacherToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1),
        teacherId: new mongoose.Types.ObjectId(teacherUser1.collegeId), // Matches assigned teacher
        isActive: true,
      });

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      assert.strictEqual(callbackResult?.success, true);
      assert.ok(socket.rooms.has(`class_${testClassroomId}`), 'Assigned teacher must join room');
    } finally {
      Classroom.findById = origFindById;
    }
  });

  await t.test('10. Director can join any institutional classroom', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: directorToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    const origFindById = Classroom.findById;

    try {
      Classroom.findById = () => ({
        _id: new mongoose.Types.ObjectId(testClassroomId),
        institutionId: new mongoose.Types.ObjectId(instId1),
        teacherId: new mongoose.Types.ObjectId(), // Any teacher
        isActive: true,
      });

      let callbackResult = null;
      await socket.trigger('joinClassroom', { classroomId: testClassroomId }, (res) => {
        callbackResult = res;
      });

      assert.strictEqual(callbackResult?.success, true);
      assert.ok(socket.rooms.has(`class_${testClassroomId}`), 'Director must join room');
    } finally {
      Classroom.findById = origFindById;
    }
  });

  await t.test('11. Tampered or malformed classroomId is rejected safely', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const malformedIds = ['invalid-id', '../../../etc/passwd', '123', null, ''];

    for (const badId of malformedIds) {
      await socket.trigger('joinClassroom', { classroomId: badId });
      const err = socket.getLastEmitted('roomError');
      assert.ok(err, `Must emit roomError for bad ID: ${badId}`);
      assert.match(err.error, /Invalid classroom ID format/);
    }
  });

  // SECTION 3: BROADCAST ISOLATION & CHAT SCOPING
  await t.test('12. Classroom chat reaches only authorized classroom members, not global', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const testClassroomId = new mongoose.Types.ObjectId().toString();
    socket.join(`class_${testClassroomId}`);
    socket.joinedClassrooms.add(testClassroomId);

    const origCreate = Message.create;
    try {
      Message.create = (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

      await socket.trigger('sendMessage', {
        classroomId: testClassroomId,
        content: 'Hello classmates in Room 101!',
      });

      // Check room broadcasts
      const broadcasts = harness.roomBroadcasts;
      assert.strictEqual(broadcasts.length, 1, 'Must emit exactly one room broadcast');
      assert.strictEqual(broadcasts[0].room, `class_${testClassroomId}`);
      assert.strictEqual(broadcasts[0].event, 'receiveMessage');
      assert.strictEqual(broadcasts[0].payload.content, 'Hello classmates in Room 101!');
      assert.strictEqual(broadcasts[0].payload.sender, 'Alice Johnson');
      assert.strictEqual(broadcasts[0].payload.classroomId, testClassroomId);

      // Verify no global broadcasts occurred
      const globalBroadcasts = broadcasts.filter((b) => b.room === 'GLOBAL' || b.room === 'GLOBAL_BROADCAST');
      assert.strictEqual(globalBroadcasts.length, 0, 'Must NOT broadcast globally');
    } finally {
      Message.create = origCreate;
    }
  });

  await t.test('13. User cannot emit to a classroom room they have not joined', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const unjoinedClassroomId = new mongoose.Types.ObjectId().toString();

    const origCreate = Message.create;
    let createCalled = false;
    try {
      Message.create = (doc) => {
        createCalled = true;
        return doc;
      };

      await socket.trigger('sendMessage', {
        classroomId: unjoinedClassroomId,
        content: 'Unauthorized message attempt',
      });

      const err = socket.getLastEmitted('messageError');
      assert.ok(err);
      assert.match(err.error, /Unauthorized: You have not joined this classroom/);
      assert.strictEqual(createCalled, false, 'Database write must NOT occur on unauthorized emit');
      assert.strictEqual(harness.roomBroadcasts.length, 0, 'No broadcast must occur');
    } finally {
      Message.create = origCreate;
    }
  });

  await t.test('14. Default chat without classroomId routes strictly to institutional room', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const origCreate = Message.create;
    try {
      Message.create = (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

      // Emitted without classroomId (standalone or general chat)
      await socket.trigger('sendMessage', {
        content: 'Campus-wide announcement',
      });

      const broadcasts = harness.roomBroadcasts;
      assert.strictEqual(broadcasts.length, 1);
      assert.strictEqual(broadcasts[0].room, `inst_${instId1}`, 'Must be scoped strictly to user institution room');
      assert.strictEqual(broadcasts[0].payload.content, 'Campus-wide announcement');
    } finally {
      Message.create = origCreate;
    }
  });

  // SECTION 4: PAYLOAD VALIDATION & ABUSE PREVENTION
  await t.test('15. Empty, malformed, or oversized chat payload is rejected', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    // 15.1 Null or empty
    await socket.trigger('sendMessage', null);
    assert.match(socket.getLastEmitted('messageError').error, /Invalid message payload/);

    await socket.trigger('sendMessage', { content: '' });
    assert.match(socket.getLastEmitted('messageError').error, /Message content cannot be empty/);

    await socket.trigger('sendMessage', { content: '   ' });
    assert.match(socket.getLastEmitted('messageError').error, /Message content cannot be empty/);

    // 15.2 Oversized payload (> 5000 chars)
    const hugeMessage = 'A'.repeat(5001);
    await socket.trigger('sendMessage', { content: hugeMessage });
    assert.match(socket.getLastEmitted('messageError').error, /Message exceeds maximum allowed length/);
  });

  await t.test('16. Chat message rate limiter blocks flooding (> 10 messages in 5s)', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const origCreate = Message.create;
    try {
      Message.create = (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

      // Send 10 messages rapidly (allowed)
      for (let i = 0; i < 10; i++) {
        await socket.trigger('sendMessage', { content: `Message ${i}` });
      }

      // 11th message must be rejected by rate limiter
      await socket.trigger('sendMessage', { content: 'Flood message 11' });
      const err = socket.getLastEmitted('messageError');
      assert.ok(err);
      assert.match(err.error, /Rate limit exceeded/);
    } finally {
      Message.create = origCreate;
    }
  });

  await t.test('17. Database failure returns generic sanitized error without leaking stack', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    const origCreate = Message.create;
    try {
      Message.create = () => {
        throw new Error('FATAL_DB_CONNECTION_SECRET_PASSWORD_123');
      };

      await socket.trigger('sendMessage', { content: 'Valid message' });
      const err = socket.getLastEmitted('messageError');
      assert.ok(err);
      assert.strictEqual(err.error, 'Failed to send message', 'Must return sanitized generic error string');
      assert.strictEqual(JSON.stringify(err).includes('FATAL_DB_CONNECTION_SECRET_PASSWORD_123'), false);
    } finally {
      Message.create = origCreate;
    }
  });

  // SECTION 5: RAW WEBSOCKET ON PORT 8080 (notifyClients)
  await t.test('18. Raw WebSocket token extraction supports query string, header, and cookies', () => {
    // 18.1 Query string (?token=...)
    const reqQuery = { url: `/ws?token=${studentToken1}`, headers: {} };
    assert.strictEqual(extractWsToken(reqQuery), studentToken1);

    // 18.2 Authorization header (Bearer ...)
    const reqHeader = { url: '/ws', headers: { authorization: `Bearer ${studentToken1}` } };
    assert.strictEqual(extractWsToken(reqHeader), studentToken1);

    // 18.3 Cookie (token=...)
    const reqCookie = { url: '/ws', headers: { cookie: `other=123; token=${studentToken1}; user=alice` } };
    assert.strictEqual(extractWsToken(reqCookie), studentToken1);

    // 18.4 Missing token
    const reqEmpty = { url: '/ws', headers: {} };
    assert.strictEqual(extractWsToken(reqEmpty), null);
  });

  await t.test('19. Raw WebSocket notifyClients isolates quizzes by institution', () => {
    // Mock WebSocket clients
    const sentClient1 = [];
    const sentClient2 = [];

    const mockWs1 = {
      readyState: 1, // OPEN
      user: { id: studentUser1.userId, institutionId: instId1 },
      send(data) {
        sentClient1.push(JSON.parse(data));
      },
    };

    const mockWs2 = {
      readyState: 1, // OPEN
      user: { id: studentUser2.userId, institutionId: instId2 },
      send(data) {
        sentClient2.push(JSON.parse(data));
      },
    };

    wsClients.clear();
    wsClients.add(mockWs1);
    wsClients.add(mockWs2);

    try {
      // Quiz belonging to Institution 1
      const quizInst1 = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Physics Midterm Quiz',
        institutionId: instId1,
      };

      notifyClients(quizInst1);

      // Client 1 (Inst 1) must receive it
      assert.strictEqual(sentClient1.length, 1);
      assert.strictEqual(sentClient1[0].title, 'Physics Midterm Quiz');

      // Client 2 (Inst 2) must NOT receive it
      assert.strictEqual(sentClient2.length, 0, 'Cross-tenant quiz must not leak to Client 2');
    } finally {
      wsClients.clear();
    }
  });

  // SECTION 6: DISCONNECT & TEARDOWN
  await t.test('20. Disconnect handler cleans up socket transient state', async () => {
    const harness = createSocketHarness();
    socketService(harness.mockIo);

    const { socket, connect } = harness.createMockSocket({ auth: { token: studentToken1 } });
    await connect();

    socket.joinedClassrooms.add('class_123');
    assert.strictEqual(socket.joinedClassrooms.size, 1);

    await socket.trigger('disconnect');
    assert.strictEqual(socket.joinedClassrooms.size, 0, 'Joined classrooms must be cleared on disconnect');
  });
});

// ---------------------------------------------------------------------------
// Phase 3.1 — Quiz API & Broadcast Security
// ---------------------------------------------------------------------------



test('Phase 3.1 — Quiz API Security & Broadcast Sanitization Suite', async (t) => {
  const instId = new mongoose.Types.ObjectId().toString();
  const otherInstId = new mongoose.Types.ObjectId().toString();

  // Finds the actual route handler for POST /quizzes (skips auth middleware at stack[0])
  const getPostQuizzesHandler = () => {
    const layer = quizRouter.stack.find(
      (l) => l.route && l.route.path === '/quizzes' && l.route.methods.post
    );
    if (!layer) throw new Error('POST /quizzes route not found');
    const stack = layer.route.stack;
    return stack[stack.length - 1].handle;
  };

  const createMockRes = () => ({
    statusCode: 200,
    data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  });

  // 21. Unauthenticated POST /quizzes returns 401
  await t.test('21. POST /quizzes without token returns 401', async () => {
    const app = expressLib();
    app.use(expressLib.json());
    app.use(cookieParserLib());
    app.use('/api', quizRouter);
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request(
          { host: '127.0.0.1', port, path: '/api/quizzes', method: 'POST',
            headers: { 'Content-Type': 'application/json' } },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
          }
        );
        req.on('error', reject);
        req.write(JSON.stringify({ title: 'Hack', description: 'x', questions: [] }));
        req.end();
      });
      assert.strictEqual(response.status, 401, 'Unauthenticated POST /quizzes must return 401');
      assert.strictEqual(response.body.success, false);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // 22. Authenticated user without institutionId gets 403
  await t.test('22. POST /quizzes from user without institutionId returns 403', async () => {
    const handler = getPostQuizzesHandler();
    const origSave = Quiz.prototype.save;
    Quiz.prototype.save = function () { this._id = new mongoose.Types.ObjectId(); return this; };
    try {
      const req = {
        body: { title: 'Quiz', description: 'x', questions: [] },
        user: { id: 'u1', email: 'x@x.com', role: 'Teacher', institutionId: null },
        app: { get: () => null },
      };
      const res = createMockRes();
      await handler(req, res);
      assert.strictEqual(res.statusCode, 403, 'Must return 403 when user has no institutionId');
      assert.strictEqual(res.data.success, false);
    } finally {
      Quiz.prototype.save = origSave;
    }
  });

  // 23. Client-supplied institutionId in body is ignored; server-side value is used
  await t.test('23. institutionId from req.body is ignored; server-side value is used', async () => {
    const handler = getPostQuizzesHandler();
    let savedDoc = null;
    const origSave = Quiz.prototype.save;
    Quiz.prototype.save = function () {
      this._id = new mongoose.Types.ObjectId();
      savedDoc = this;
      return this;
    };
    const emittedRooms = [];
    const mockIo = {
      to(room) { emittedRooms.push(room); return { emit() {} }; },
      emit() { emittedRooms.push('GLOBAL'); },
    };
    try {
      const req = {
        body: { title: 'Injected', description: 'x', questions: [], institutionId: otherInstId },
        user: { id: 'u1', email: 'dir@inst.edu', role: 'Director', institutionId: instId },
        app: { get: (k) => k === 'io' ? mockIo : null },
      };
      const res = createMockRes();
      await handler(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(savedDoc.institutionId, instId, 'Persisted institutionId must be from req.user');
      assert.notStrictEqual(savedDoc.institutionId, otherInstId, 'Client institutionId must be discarded');
      assert.ok(emittedRooms.includes('inst_' + instId), 'Must broadcast to correct institution room');
      assert.ok(!emittedRooms.includes('inst_' + otherInstId), 'Must NOT broadcast to injected institution');
      assert.ok(!emittedRooms.includes('GLOBAL'), 'Must NOT emit globally');
    } finally {
      Quiz.prototype.save = origSave;
    }
  });

  // 24. new-quiz Socket.IO broadcast payload must not contain correctAnswer
  await t.test('24. new-quiz Socket.IO broadcast does not expose correctAnswer', async () => {
    const handler = getPostQuizzesHandler();
    const origSave = Quiz.prototype.save;
    Quiz.prototype.save = function () { this._id = new mongoose.Types.ObjectId(); return this; };
    let capturedPayload = null;
    const mockIo = {
      to() { return { emit(ev, data) { capturedPayload = data; } }; },
      emit() {},
    };
    try {
      const req = {
        body: {
          title: 'Math Quiz',
          description: 'Algebra',
          questions: [
            { questionText: 'What is 2+2?', options: ['3', '4', '5'], correctAnswer: 1 },
            { questionText: 'What is 5*5?', options: ['20', '25', '30'], correctAnswer: 1 },
          ],
        },
        user: { id: 'u1', email: 'dir@inst.edu', role: 'Director', institutionId: instId },
        app: { get: (k) => k === 'io' ? mockIo : null },
      };
      const res = createMockRes();
      await handler(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.ok(capturedPayload, 'Broadcast payload must be emitted');
      assert.ok(Array.isArray(capturedPayload.questions));
      for (const q of capturedPayload.questions) {
        assert.strictEqual(
          Object.prototype.hasOwnProperty.call(q, 'correctAnswer'), false,
          q.questionText + ' must not expose correctAnswer in broadcast'
        );
      }
      assert.strictEqual(capturedPayload.institutionId, instId);
    } finally {
      Quiz.prototype.save = origSave;
    }
  });

  // 25. new-quiz is NOT broadcast to a different institution's room
  await t.test('25. new-quiz is NOT broadcast to a different institution Socket.IO room', async () => {
    const handler = getPostQuizzesHandler();
    const origSave = Quiz.prototype.save;
    Quiz.prototype.save = function () { this._id = new mongoose.Types.ObjectId(); return this; };
    const emittedRooms = [];
    const mockIo = {
      to(room) { return { emit() { emittedRooms.push(room); } }; },
      emit() { emittedRooms.push('GLOBAL'); },
    };
    try {
      const req = {
        body: { title: 'Inst1 Quiz', description: 'x', questions: [] },
        user: { id: 'u1', email: 'dir@inst1.edu', role: 'Director', institutionId: instId },
        app: { get: (k) => k === 'io' ? mockIo : null },
      };
      const res = createMockRes();
      await handler(req, res);
      assert.ok(emittedRooms.includes('inst_' + instId), 'Must emit to correct institution room');
      assert.ok(!emittedRooms.includes('inst_' + otherInstId), 'Must NOT emit to other institution');
      assert.ok(!emittedRooms.includes('GLOBAL'), 'Must NOT emit globally');
    } finally {
      Quiz.prototype.save = origSave;
    }
  });

  // 26. notifyClients strips correctAnswer before sending to raw WebSocket clients
  await t.test('26. notifyClients strips correctAnswer from raw WebSocket payload', () => {
    const received = [];
    const mockWsClient = {
      readyState: 1,
      user: { id: 'stu1', institutionId: instId },
      send(data) { received.push(JSON.parse(data)); },
    };
    wsClients.clear();
    wsClients.add(mockWsClient);
    try {
      notifyClientsFn({
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Physics Quiz',
        description: 'Mechanics',
        institutionId: instId,
        questions: [{
          _id: new mongoose.Types.ObjectId().toString(),
          questionText: 'F=ma?',
          options: ['Yes', 'No'],
          correctAnswer: 0,
        }],
      });
      assert.strictEqual(received.length, 1, 'Client must receive exactly one message');
      const q = received[0].questions[0];
      assert.ok(q, 'Question must be present');
      assert.strictEqual(
        Object.prototype.hasOwnProperty.call(q, 'correctAnswer'), false,
        'correctAnswer must be stripped from WebSocket payload'
      );
    } finally {
      wsClients.clear();
    }
  });

  // 27. notifyClients suppresses global broadcast when institutionId is absent
  await t.test('27. notifyClients suppresses broadcast when institutionId is absent', () => {
    const received = [];
    const mockWsClient = {
      readyState: 1,
      user: { id: 'stu1', institutionId: instId },
      send(data) { received.push(JSON.parse(data)); },
    };
    wsClients.clear();
    wsClients.add(mockWsClient);
    try {
      notifyClientsFn({ _id: 'x', title: 'Unscoped Quiz', questions: [] });
      assert.strictEqual(received.length, 0, 'Broadcast must be suppressed when institutionId is absent');
    } finally {
      wsClients.clear();
    }
  });

  // 28. notifyClients does not deliver cross-institution quiz to wrong client
  await t.test('28. notifyClients does not deliver quiz to wrong institution client', () => {
    const wrongReceived = [];
    const wrongClient = {
      readyState: 1,
      user: { id: 'stu2', institutionId: otherInstId },
      send(data) { wrongReceived.push(JSON.parse(data)); },
    };
    wsClients.clear();
    wsClients.add(wrongClient);
    try {
      notifyClientsFn({
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Inst1 Only',
        description: 'Exclusive',
        institutionId: instId,
        questions: [],
      });
      assert.strictEqual(wrongReceived.length, 0, 'Cross-institution quiz must not reach wrong client');
    } finally {
      wsClients.clear();
    }
  });
});

