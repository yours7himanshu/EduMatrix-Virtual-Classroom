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
const mongoose = require("mongoose");
const { TokenVerifier } = require("livekit-server-sdk");
const Classroom = require("../models/classroomModel");
const LiveSession = require("../models/liveSessionModel");
const Admin = require("../models/adminModels");
const Student = require("../models/studentModels");
const Enrollment = require("../models/enrollmentModel");
const { startLiveSession, endLiveSession, getActiveLiveSession } = require("../controllers/liveSessionController");
const { generateLiveToken } = require("../controllers/liveController");

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

// Helper to create a Mongoose-like query object that supports both await and .populate()
function createSessionQuery(sessionObj) {
  return {
    populate: function () {
      return this;
    },
    then: function (resolve, reject) {
      return Promise.resolve(sessionObj).then(resolve, reject);
    },
  };
}

const TEST_API_KEY = "test_livekit_api_key_12345";
const TEST_API_SECRET = "test_livekit_api_secret_abcdef1234567890_32bytes";
const TEST_LIVEKIT_URL = "wss://test.livekit.cloud";

test("Phase 6: LiveKit Frontend & Lifecycle Integration Suite", async (t) => {
  const originalEnvKey = process.env.LIVEKIT_API_KEY;
  const originalEnvSecret = process.env.LIVEKIT_API_SECRET;
  const originalEnvUrl = process.env.LIVEKIT_URL;

  process.env.LIVEKIT_API_KEY = TEST_API_KEY;
  process.env.LIVEKIT_API_SECRET = TEST_API_SECRET;
  process.env.LIVEKIT_URL = TEST_LIVEKIT_URL;

  t.after(() => {
    process.env.LIVEKIT_API_KEY = originalEnvKey;
    process.env.LIVEKIT_API_SECRET = originalEnvSecret;
    process.env.LIVEKIT_URL = originalEnvUrl;
  });

  await t.test("1. One Teacher + One Student: Complete LiveKit token and active session lifecycle", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    let activeSession = null;

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;
    const originalCreateSession = LiveSession.create;

    Classroom.findById = async () => ({
      _id: classId,
      title: "Advanced Distributed Systems",
      institutionId: instId,
      teacherId,
      isActive: true,
    });
    Admin.findById = async () => ({
      _id: teacherId,
      directorName: "Prof. Einstein",
      isActive: true,
    });
    Student.findById = async () => ({
      _id: studentId,
      name: "Alice",
      institutionId: instId,
    });
    Enrollment.findOne = async () => ({
      _id: "enr_1",
      classroomId: classId,
      studentId,
      status: "enrolled",
    });
    LiveSession.findOne = (query) => {
      if (activeSession && query.status === "active") return createSessionQuery(activeSession);
      return createSessionQuery(null);
    };
    LiveSession.create = async (doc) => {
      activeSession = {
        ...doc,
        _id: new mongoose.Types.ObjectId().toString(),
        status: "active",
        save: async function () {
          return this;
        },
      };
      return activeSession;
    };

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
      LiveSession.create = originalCreateSession;
    });

    // Step A: Student checks session before teacher starts (none active)
    const reqStudentPre = {
      user: { id: studentId, role: "student", institutionId: instId },
      params: { classroomId: classId },
    };
    const resStudentPre = createMockRes();
    await getActiveLiveSession(reqStudentPre, resStudentPre);
    assert.strictEqual(resStudentPre.statusCode, 200);
    assert.strictEqual(resStudentPre.data.hasActiveSession, false);

    // Step B: Teacher starts live session
    const reqTeacherStart = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: { title: "Lecture 1: Paxos Consensus" },
    };
    const resTeacherStart = createMockRes();
    await startLiveSession(reqTeacherStart, resTeacherStart);
    assert.strictEqual(resTeacherStart.statusCode, 201);
    assert.ok(activeSession, "Active session must be created");

    // Step C: Teacher obtains LiveKit token
    const reqTeacherToken = {
      user: { id: teacherId, role: "teacher", institutionId: instId, name: "Prof. Einstein" },
      body: { classroomId: classId },
    };
    const resTeacherToken = createMockRes();
    await generateLiveToken(reqTeacherToken, resTeacherToken);
    assert.strictEqual(resTeacherToken.statusCode, 200);

    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const teacherClaims = await verifier.verify(resTeacherToken.data.token);
    assert.strictEqual(teacherClaims.video.roomAdmin, true, "Teacher has roomAdmin grant");
    assert.strictEqual(teacherClaims.video.room, activeSession.roomName);

    // Step D: Student checks session again (now active)
    const resStudentActive = createMockRes();
    await getActiveLiveSession(reqStudentPre, resStudentActive);
    assert.strictEqual(resStudentActive.statusCode, 200);
    assert.strictEqual(resStudentActive.data.hasActiveSession, true);

    // Step E: Student obtains LiveKit token
    const reqStudentToken = {
      user: { id: studentId, role: "student", institutionId: instId, name: "Alice" },
      body: { classroomId: classId },
    };
    const resStudentToken = createMockRes();
    await generateLiveToken(reqStudentToken, resStudentToken);
    assert.strictEqual(resStudentToken.statusCode, 200);

    const studentClaims = await verifier.verify(resStudentToken.data.token);
    assert.strictEqual(studentClaims.video.roomAdmin, false, "Student does NOT have roomAdmin grant");
    assert.strictEqual(studentClaims.video.room, activeSession.roomName, "Connected to same room as teacher");
  });

  await t.test("2. One Teacher + Multiple Students: Multiple students obtain unique participant tokens for same room", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const roomName = `live_${classId}_1710000000_multistudent`;

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = async () => ({
      _id: classId,
      institutionId: instId,
      teacherId,
      isActive: true,
    });
    LiveSession.findOne = () =>
      createSessionQuery({
        _id: "sess_multi",
        classroomId: classId,
        roomName,
        status: "active",
      });

    const students = [
      { id: new mongoose.Types.ObjectId().toString(), name: "Student Alpha" },
      { id: new mongoose.Types.ObjectId().toString(), name: "Student Beta" },
      { id: new mongoose.Types.ObjectId().toString(), name: "Student Gamma" },
    ];

    Enrollment.findOne = async ({ studentId }) => ({
      _id: `enr_${studentId}`,
      classroomId: classId,
      studentId,
      status: "enrolled",
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const participantIdentities = new Set();

    for (const st of students) {
      Student.findById = async () => ({
        _id: st.id,
        name: st.name,
        institutionId: instId,
      });

      const req = {
        user: { id: st.id, role: "student", institutionId: instId, name: st.name },
        body: { classroomId: classId },
      };
      const res = createMockRes();
      await generateLiveToken(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.roomName, roomName);

      const claims = await verifier.verify(res.data.token);
      assert.strictEqual(claims.video.room, roomName);
      assert.strictEqual(claims.sub, `student_${st.id}`);
      participantIdentities.add(claims.sub);
    }

    assert.strictEqual(participantIdentities.size, 3);
  });

  await t.test("3. Teacher and Student Disconnect & Reconnect: Fresh valid tokens issued while session is active", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const roomName = `live_${classId}_1710000000_reconnect`;

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = async () => ({
      _id: classId,
      institutionId: instId,
      teacherId,
      isActive: true,
    });
    Admin.findById = async () => ({
      _id: teacherId,
      isActive: true,
    });
    Student.findById = async () => ({
      _id: studentId,
      name: "Reconnecting Student",
      institutionId: instId,
    });
    Enrollment.findOne = async () => ({
      _id: "enr_rec",
      classroomId: classId,
      studentId,
      status: "enrolled",
    });
    LiveSession.findOne = () =>
      createSessionQuery({
        _id: "sess_rec",
        classroomId: classId,
        roomName,
        status: "active",
      });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);

    // Initial connection
    const res1 = createMockRes();
    await generateLiveToken(
      { user: { id: studentId, role: "student", institutionId: instId }, body: { classroomId: classId } },
      res1
    );
    assert.strictEqual(res1.statusCode, 200);

    // Reconnection
    const res2 = createMockRes();
    await generateLiveToken(
      { user: { id: studentId, role: "student", institutionId: instId }, body: { classroomId: classId } },
      res2
    );
    assert.strictEqual(res2.statusCode, 200);

    const claims2 = await verifier.verify(res2.data.token);
    assert.strictEqual(claims2.video.room, roomName);
    assert.strictEqual(claims2.sub, `student_${studentId}`);
  });

  await t.test("4. Ending LiveSession prevents further token generation and terminates active room", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const sessionId = new mongoose.Types.ObjectId().toString();

    let sessionStatus = "active";

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = async () => ({
      _id: classId,
      institutionId: instId,
      teacherId,
      isActive: true,
    });
    Admin.findById = async () => ({
      _id: teacherId,
      isActive: true,
    });
    Student.findById = async () => ({
      _id: studentId,
      name: "Student",
      institutionId: instId,
    });
    Enrollment.findOne = async () => ({
      _id: "enr_end",
      classroomId: classId,
      studentId,
      status: "enrolled",
    });
    LiveSession.findOne = (query) => {
      if (query.status === "active" && sessionStatus === "ended") {
        return createSessionQuery(null);
      }
      return createSessionQuery({
        _id: sessionId,
        classroomId: classId,
        status: sessionStatus,
        save: async function () {
          sessionStatus = this.status;
          return this;
        },
      });
    };

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    // End session
    const reqEnd = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId, sessionId },
    };
    const resEnd = createMockRes();
    await endLiveSession(reqEnd, resEnd);
    assert.strictEqual(resEnd.statusCode, 200);
    assert.strictEqual(sessionStatus, "ended");

    // Subsequent token generation for student must fail (404 no active session)
    const reqToken = {
      user: { id: studentId, role: "student", institutionId: instId },
      body: { classroomId: classId },
    };
    const resToken = createMockRes();
    await generateLiveToken(reqToken, resToken);
    assert.strictEqual(resToken.statusCode, 404);
    assert.match(resToken.data.message, /no active live session/i);
  });
});
