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
const authenticateUser = require("../middlewares/unifiedAuth");
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

const TEST_API_KEY = "test_livekit_api_key_12345";
const TEST_API_SECRET = "test_livekit_api_secret_abcdef1234567890_32bytes";
const TEST_LIVEKIT_URL = "wss://test.livekit.cloud";

test("Phase 5: Secure Server-Side LiveKit Token Generation Suite", async (t) => {
  const originalEnvKey = process.env.LIVEKIT_API_KEY;
  const originalEnvSecret = process.env.LIVEKIT_API_SECRET;
  const originalEnvUrl = process.env.LIVEKIT_URL;

  // Set predictable test environment for LiveKit
  process.env.LIVEKIT_API_KEY = TEST_API_KEY;
  process.env.LIVEKIT_API_SECRET = TEST_API_SECRET;
  process.env.LIVEKIT_URL = TEST_LIVEKIT_URL;

  t.after(() => {
    process.env.LIVEKIT_API_KEY = originalEnvKey;
    process.env.LIVEKIT_API_SECRET = originalEnvSecret;
    process.env.LIVEKIT_URL = originalEnvUrl;
  });

  await t.test("1. Valid teacher generates token with roomAdmin permissions and verified signature", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const sessionId = new mongoose.Types.ObjectId().toString();
    const roomName = `live_${classId}_1710000000_abcd`;

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
      directorName: "Prof. Einstein",
      email: "einstein@college.edu",
      isActive: true,
    });
    LiveSession.findOne = () => ({
      _id: sessionId,
      classroomId: classId,
      hostTeacherId: teacherId,
      roomName,
      status: "active",
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId, name: "Prof. Einstein" },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.roomName, roomName);
    assert.strictEqual(res.data.livekitUrl, TEST_LIVEKIT_URL);
    assert.strictEqual(res.data.participant.identity, `teacher_${teacherId}`);
    assert.strictEqual(res.data.participant.role, "teacher");
    assert.ok(typeof res.data.token === "string", "Token must be a non-empty string");

    // Cryptographic verification with matching secret
    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const claims = await verifier.verify(res.data.token);
    assert.strictEqual(claims.sub, `teacher_${teacherId}`);
    assert.strictEqual(claims.video.room, roomName);
    assert.strictEqual(claims.video.roomJoin, true);
    assert.strictEqual(claims.video.canPublish, true);
    assert.strictEqual(claims.video.roomAdmin, true, "Teacher must be granted roomAdmin grant");
  });

  await t.test("2. Valid enrolled student generates token with participant permissions and verified signature", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const sessionId = new mongoose.Types.ObjectId().toString();
    const roomName = `live_${classId}_1710000000_abcd`;

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      isActive: true,
    });
    Student.findById = () => ({
      _id: studentId,
      name: "Ada Lovelace",
      email: "ada@college.edu",
      institutionId: instId,
    });
    Enrollment.findOne = () => ({
      _id: "enr_1",
      classroomId: classId,
      studentId,
      status: "enrolled",
    });
    LiveSession.findOne = () => ({
      _id: sessionId,
      classroomId: classId,
      roomName,
      status: "active",
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: instId, name: "Ada Lovelace" },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.roomName, roomName);
    assert.strictEqual(res.data.participant.identity, `student_${studentId}`);
    assert.strictEqual(res.data.participant.role, "student");

    // Cryptographic verification
    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const claims = await verifier.verify(res.data.token);
    assert.strictEqual(claims.sub, `student_${studentId}`);
    assert.strictEqual(claims.video.room, roomName);
    assert.strictEqual(claims.video.roomJoin, true);
    assert.strictEqual(claims.video.canPublish, true);
    assert.strictEqual(claims.video.roomAdmin, false, "Student must NOT be granted roomAdmin grant");
  });

  await t.test("3. Unauthenticated request is rejected with 401", async () => {
    // 3a. Middleware check
    const reqAuth = { headers: {}, cookies: {} };
    const resAuth = createMockRes();
    let nextCalled = false;
    authenticateUser(reqAuth, resAuth, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(resAuth.statusCode, 401);
    assert.strictEqual(resAuth.data.success, false);

    // 3b. Controller guard check if req.user is absent
    const reqController = { body: { classroomId: new mongoose.Types.ObjectId().toString() } };
    const resController = createMockRes();
    await generateLiveToken(reqController, resController);
    assert.strictEqual(resController.statusCode, 401);
    assert.strictEqual(resController.data.success, false);
  });

  await t.test("4. Cross-institution classroom access is rejected with 403", async () => {
    const classId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classId,
      institutionId: "inst_alpha",
      teacherId: teacherId,
      isActive: true,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: "inst_beta" },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /cross-institution/i);
  });

  await t.test("5. Teacher who does not own the classroom is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const assignedTeacherId = new mongoose.Types.ObjectId().toString();
    const callingTeacherId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: assignedTeacherId, // Assigned to different teacher
      isActive: true,
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: callingTeacherId, role: "teacher", institutionId: instId },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /not the assigned teacher/i);
  });

  await t.test("6. Inactive teacher account is rejected with 400", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindAdmin = Admin.findById;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      isActive: true,
    });
    Admin.findById = () => ({
      _id: teacherId,
      directorName: "Prof. Inactive",
      isActive: false, // Inactive account!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /inactive/i);
  });

  await t.test("7. Non-enrolled student is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: "teacher_1",
      isActive: true,
    });
    Student.findById = () => ({
      _id: studentId,
      name: "Non-enrolled Student",
      institutionId: instId,
    });
    Enrollment.findOne = () => null; // No enrollment

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: instId },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /not enrolled/i);
  });

  await t.test("8. Dropped student is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: "teacher_1",
      isActive: true,
    });
    Student.findById = () => ({
      _id: studentId,
      name: "Dropped Student",
      institutionId: instId,
    });
    Enrollment.findOne = () => ({
      _id: "enr_dropped",
      classroomId: classId,
      studentId,
      status: "dropped", // Dropped!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: studentId, role: "student", institutionId: instId },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /dropped/i);
  });

  await t.test("9. Rejects with 404 when no active LiveSession exists", async () => {
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
      isActive: true,
    });
    LiveSession.findOne = () => null; // No active session!

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /no active live session/i);
  });

  await t.test("10. Client attempting to spoof teacher role/identity is neutralized (uses verified JWT context)", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const sessionId = new mongoose.Types.ObjectId().toString();
    const roomName = `live_${classId}_1710000000_abcd`;

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalFindSession = LiveSession.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
      isActive: true,
    });
    Student.findById = () => ({
      _id: studentId,
      name: "Student Impersonator",
      institutionId: instId,
    });
    Enrollment.findOne = () => ({
      _id: "enr_1",
      classroomId: classId,
      studentId,
      status: "enrolled",
    });
    LiveSession.findOne = () => ({
      _id: sessionId,
      classroomId: classId,
      roomName,
      status: "active",
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      LiveSession.findOne = originalFindSession;
    });

    // Malicious student payload attempting to claim teacher role, isTeacher true, and fake teacher identity
    const req = {
      user: { id: studentId, role: "student", institutionId: instId, name: "Student Impersonator" },
      body: {
        classroomId: classId,
        role: "teacher",
        isTeacher: true,
        identity: "teacher_admin_fake_999",
      },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 200);
    // Identity must be derived strictly server-side from req.user
    assert.strictEqual(res.data.participant.identity, `student_${studentId}`);
    assert.notStrictEqual(res.data.participant.identity, "teacher_admin_fake_999");
    assert.strictEqual(res.data.participant.role, "student");

    // Cryptographic claims check
    const verifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const claims = await verifier.verify(res.data.token);
    assert.strictEqual(claims.sub, `student_${studentId}`);
    assert.strictEqual(claims.video.roomAdmin, false, "Impersonation must NOT result in roomAdmin grant");
  });

  await t.test("11. LiveKit configuration failure returns 500 safely without exposing secrets", async () => {
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;

    const req = {
      user: { id: "user_1", role: "teacher" },
      body: { classroomId: new mongoose.Types.ObjectId().toString() },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /LiveKit server configuration error/i);
    assert.strictEqual(res.data.token, undefined);
  });

  await t.test("12. Cryptographic signature verification rejects tampered or mismatched secrets", async () => {
    process.env.LIVEKIT_API_KEY = TEST_API_KEY;
    process.env.LIVEKIT_API_SECRET = TEST_API_SECRET;

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
      directorName: "Prof. Einstein",
      isActive: true,
    });
    LiveSession.findOne = () => ({
      _id: sessionId,
      classroomId: classId,
      roomName: "live_room_signature_test",
      status: "active",
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Admin.findById = originalFindAdmin;
      LiveSession.findOne = originalFindSession;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId, name: "Prof. Einstein" },
      body: { classroomId: classId },
    };
    const res = createMockRes();

    await generateLiveToken(req, res);
    assert.strictEqual(res.statusCode, 200);
    const validToken = res.data.token;

    // 1. Verifying with correct secret succeeds
    const correctVerifier = new TokenVerifier(TEST_API_KEY, TEST_API_SECRET);
    const claims = await correctVerifier.verify(validToken);
    assert.ok(claims, "Valid token verification must succeed");

    // 2. Verifying with incorrect secret fails cryptographically
    const wrongVerifier = new TokenVerifier(TEST_API_KEY, "wrong_secret_12345678901234567890");
    await assert.rejects(
      async () => {
        await wrongVerifier.verify(validToken);
      },
      /verification failed|signature/i,
      "Verification must reject signature with mismatched secret"
    );

    // 3. Verifying tampered token fails cryptographically
    const tamperedToken = validToken.slice(0, -5) + "abcde";
    await assert.rejects(
      async () => {
        await correctVerifier.verify(tamperedToken);
      },
      /verification failed|signature/i,
      "Verification must reject tampered token string"
    );
  });
});
