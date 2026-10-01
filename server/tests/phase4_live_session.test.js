const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const LiveSession = require("../models/liveSessionModel");
const Classroom = require("../models/classroomModel");
const Admin = require("../models/adminModels");
const Enrollment = require("../models/enrollmentModel");
const {
  startLiveSession,
  endLiveSession,
  getActiveLiveSession,
  getHistoricalSessions,
} = require("../controllers/liveSessionController");

function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

test("Phase 4: LiveSession Lifecycle & Authorization Suite", async (t) => {
  await t.test("1. LiveSession schema defines required fields, status enum, and unique roomName", () => {
    const paths = LiveSession.schema.paths;
    assert.ok(paths.classroomId, "LiveSession must define classroomId");
    assert.ok(paths.hostTeacherId, "LiveSession must define hostTeacherId");
    assert.ok(paths.roomName, "LiveSession must define roomName");
    assert.ok(paths.status, "LiveSession must define status");
    assert.ok(paths.startedAt, "LiveSession must define startedAt");
    assert.ok(paths.endedAt, "LiveSession must define endedAt");

    const statusEnum = paths.status.enumValues;
    assert.ok(statusEnum.includes("active"), "status must include 'active'");
    assert.ok(statusEnum.includes("ended"), "status must include 'ended'");

    // Classroom must NOT have roomName
    assert.strictEqual(Classroom.schema.paths.roomName, undefined, "Classroom must never define roomName");
  });

  await t.test("2. Assigned active teacher successfully starts a live session with server-generated roomName", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindSession = LiveSession.findOne;
    const originalCreateSession = LiveSession.create;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      title: "Distributed Systems",
      isActive: true,
    });
    Admin.findById = () => ({
      _id: teacherId,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });
    LiveSession.findOne = () => null; // No active session
    LiveSession.create = (doc) => ({ _id: new mongoose.Types.ObjectId().toString(), ...doc });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
      LiveSession.create = originalCreateSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: { title: "Lecture 1: Consensus" },
    };
    const res = createMockRes();

    await startLiveSession(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.session.status, "active");
    assert.strictEqual(res.data.session.hostTeacherId, teacherId);
    assert.ok(res.data.session.roomName.startsWith(`live_${classId}_`), "roomName must be unique server-generated string");
  });

  await t.test("3. Teacher who does not own the classroom is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacher1Id = new mongoose.Types.ObjectId().toString();
    const teacher2Id = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacher2Id, // Owned by teacher2!
      isActive: true,
    });
    Admin.findById = () => ({
      _id: teacher2Id,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: teacher1Id, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: {},
    };
    const res = createMockRes();

    await startLiveSession(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /only start\/end live sessions for their own classrooms/i);
  });

  await t.test("4. Starting a session when assigned teacher is inactive is rejected with 400", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const directorId = new mongoose.Types.ObjectId().toString();
    const inactiveTeacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: inactiveTeacherId,
      isActive: true,
    });
    Admin.findById = () => ({
      _id: inactiveTeacherId,
      role: "Teacher",
      isActive: false, // Inactive!
      institutionId: instId,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: directorId, role: "director", institutionId: instId },
      params: { classroomId: classId },
      body: {},
    };
    const res = createMockRes();

    await startLiveSession(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /inactive/i);
  });

  await t.test("5. Cross-institution session start is rejected with 403", async () => {
    const instA = new mongoose.Types.ObjectId().toString();
    const instB = new mongoose.Types.ObjectId().toString();
    const directorB = new mongoose.Types.ObjectId().toString();
    const classA = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classA,
      institutionId: instA, // College A!
      teacherId: "teacher_a",
      isActive: true,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: directorB, role: "director", institutionId: instB }, // College B!
      params: { classroomId: classA },
      body: {},
    };
    const res = createMockRes();

    await startLiveSession(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Cross-institution/i);
  });

  await t.test("6. Duplicate active session is rejected with 409 Conflict", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      isActive: true,
    });
    Admin.findById = () => ({
      _id: teacherId,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });
    LiveSession.findOne = () => ({
      _id: "existing_active_session",
      classroomId: classId,
      status: "active", // Already active!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: {},
    };
    const res = createMockRes();

    await startLiveSession(req, res);

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /already currently active/i);
  });

  await t.test("7. Ending a live session updates status to 'ended', sets endedAt, and preserves record", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const sessionId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      isActive: true,
    });
    Admin.findById = () => ({
      _id: teacherId,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });

    const activeSession = {
      _id: sessionId,
      classroomId: classId,
      status: "active",
      startedAt: new Date("2024-01-01T10:00:00Z"),
      endedAt: null,
      save: function () { return this; },
    };
    LiveSession.findOne = () => activeSession;

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId, sessionId: sessionId },
    };
    const res = createMockRes();

    await endLiveSession(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(activeSession.status, "ended");
    assert.ok(activeSession.endedAt instanceof Date, "endedAt must be set to Date");
  });

  await t.test("8. Students cannot start or end live sessions (403 Forbidden)", async () => {
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classId,
      institutionId: "inst_1",
      teacherId: "teacher_1",
      isActive: true,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: "inst_1" },
      params: { classroomId: classId, sessionId: "sess_1" },
    };
    const resStart = createMockRes();
    await startLiveSession(req, resStart);
    assert.strictEqual(resStart.statusCode, 403);
    assert.match(resStart.data.message, /Students are not permitted to manage live sessions/i);

    const resEnd = createMockRes();
    await endLiveSession(req, resEnd);
    assert.strictEqual(resEnd.statusCode, 403);
    assert.match(resEnd.data.message, /Students are not permitted to manage live sessions/i);
  });

  await t.test("9. Enrolled student can check active live session (200 OK)", async () => {
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const instId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      isActive: true,
    });
    Enrollment.findOne = () => ({
      classroomId: classId,
      studentId: studentId,
      status: "enrolled", // Enrolled!
    });
    LiveSession.findOne = () => ({
      populate: () => ({
        _id: "active_sess_id",
        classroomId: classId,
        status: "active",
        roomName: "live_room_abc",
      }),
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: instId },
      params: { classroomId: classId },
    };
    const res = createMockRes();

    await getActiveLiveSession(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.hasActiveSession, true);
    assert.strictEqual(res.data.session.roomName, "live_room_abc");
  });

  await t.test("10. Non-enrolled student checking active live session is rejected with 403", async () => {
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const instId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      isActive: true,
    });
    Enrollment.findOne = () => null; // Not enrolled!

    t.after(() => {
      Classroom.findById = originalFindClass;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: instId },
      params: { classroomId: classId },
    };
    const res = createMockRes();

    await getActiveLiveSession(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /must be enrolled/i);
  });
});
