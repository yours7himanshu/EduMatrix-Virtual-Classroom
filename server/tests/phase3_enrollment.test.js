const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollmentModel");
const Classroom = require("../models/classroomModel");
const Student = require("../models/studentModels");
const {
  enrollStudentInClassroom,
  getClassroomRoster,
  updateEnrollmentStatus,
  getMyEnrolledClassrooms,
} = require("../controllers/enrollmentController");

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

test("Phase 3: Enrollment & Roster Management Suite", async (t) => {
  await t.test("1. Enrollment schema defines required fields, valid statuses, and compound unique index", () => {
    const paths = Enrollment.schema.paths;
    assert.ok(paths.classroomId, "Enrollment must define classroomId");
    assert.ok(paths.studentId, "Enrollment must define studentId");
    assert.ok(paths.status, "Enrollment must define status");
    assert.ok(paths.enrolledAt, "Enrollment must define enrolledAt");
    assert.ok(paths.droppedAt, "Enrollment must define droppedAt");

    const statusEnum = paths.status.enumValues;
    assert.ok(statusEnum.includes("enrolled"), "status enum must include 'enrolled'");
    assert.ok(statusEnum.includes("dropped"), "status enum must include 'dropped'");

    // Check compound unique index { classroomId: 1, studentId: 1 }
    const indexes = Enrollment.schema.indexes();
    const hasUniqueCompoundIndex = indexes.some(
      ([idx, opts]) => idx.classroomId === 1 && idx.studentId === 1 && opts && opts.unique === true
    );
    assert.strictEqual(hasUniqueCompoundIndex, true, "Enrollment must enforce unique compound index on { classroomId, studentId }");

    // Verify Classroom schema does NOT embed students
    assert.strictEqual(Classroom.schema.paths.students, undefined, "Classroom must not embed students array");
    assert.strictEqual(Classroom.schema.paths.enrolledStudents, undefined, "Classroom must not embed enrolledStudents array");
  });

  await t.test("2. Owning teacher successfully enrolls a student in their classroom", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalCreateEnrollment = Enrollment.create;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
    });
    Student.findById = () => ({
      _id: studentId,
      institutionId: instId,
      name: "Alice",
      email: "alice@test.edu",
    });
    Enrollment.findOne = () => null; // Not already enrolled
    Enrollment.create = (doc) => ({ _id: new mongoose.Types.ObjectId().toString(), ...doc });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      Enrollment.create = originalCreateEnrollment;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: { studentId: studentId },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.enrollment.classroomId, classId);
    assert.strictEqual(res.data.enrollment.studentId, studentId);
    assert.strictEqual(res.data.enrollment.status, "enrolled");
  });

  await t.test("3. Teacher cannot enroll student in a classroom owned by another teacher (403)", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacher1Id = new mongoose.Types.ObjectId().toString();
    const teacher2Id = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacher2Id, // Owned by teacher2!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: teacher1Id, role: "teacher", institutionId: instId }, // Teacher 1 calling!
      params: { classroomId: classId },
      body: { studentId: new mongoose.Types.ObjectId().toString() },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /only manage enrollments for their own classrooms/i);
  });

  await t.test("4. Director can enroll student into any classroom within their institution", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const directorId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalCreateEnrollment = Enrollment.create;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
    });
    Student.findById = () => ({
      _id: studentId,
      institutionId: instId,
      name: "Bob",
    });
    Enrollment.findOne = () => null;
    Enrollment.create = (doc) => ({ _id: new mongoose.Types.ObjectId().toString(), ...doc });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      Enrollment.create = originalCreateEnrollment;
    });

    const req = {
      user: { id: directorId, role: "director", institutionId: instId },
      params: { classroomId: classId },
      body: { studentId: studentId },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
  });

  await t.test("5. Students are strictly forbidden from creating or modifying enrollments (403)", async () => {
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    Classroom.findById = () => ({
      _id: classId,
      institutionId: new mongoose.Types.ObjectId().toString(),
      teacherId: new mongoose.Types.ObjectId().toString(),
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
    });

    // Student attempting to enroll self
    const reqEnroll = {
      user: { id: studentId, role: "student", institutionId: "inst_1" },
      params: { classroomId: classId },
      body: { studentId: studentId },
    };
    const resEnroll = createMockRes();
    await enrollStudentInClassroom(reqEnroll, resEnroll);
    assert.strictEqual(resEnroll.statusCode, 403);
    assert.strictEqual(resEnroll.data.success, false);
    assert.match(resEnroll.data.message, /Students are not permitted to manage enrollments/i);

    // Student attempting to drop/update enrollment
    const reqUpdate = {
      user: { id: studentId, role: "student", institutionId: "inst_1" },
      params: { classroomId: classId, studentId: studentId },
      body: { status: "dropped" },
    };
    const resUpdate = createMockRes();
    await updateEnrollmentStatus(reqUpdate, resUpdate);
    assert.strictEqual(resUpdate.statusCode, 403);
    assert.strictEqual(resUpdate.data.success, false);
  });

  await t.test("6. Duplicate active enrollment is rejected with 409 Conflict", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
    });
    Student.findById = () => ({
      _id: studentId,
      institutionId: instId,
    });
    Enrollment.findOne = () => ({
      _id: "existing_enrollment_id",
      classroomId: classId,
      studentId: studentId,
      status: "enrolled", // Already enrolled!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: { studentId: studentId },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /already enrolled/i);
  });

  await t.test("7. Enrolling a previously dropped student restores status to 'enrolled' (200)", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
    });
    Student.findById = () => ({
      _id: studentId,
      institutionId: instId,
    });

    const droppedRecord = {
      _id: "dropped_enrollment_id",
      classroomId: classId,
      studentId: studentId,
      status: "dropped",
      enrolledAt: new Date("2024-01-01"),
      droppedAt: new Date("2024-02-01"),
      save: function () { return this; },
    };
    Enrollment.findOne = () => droppedRecord;

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId },
      body: { studentId: studentId },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(droppedRecord.status, "enrolled");
    assert.strictEqual(droppedRecord.droppedAt, null);
    assert.match(res.data.message, /re-enrolled/i);
  });

  await t.test("8. Cross-institution enrollment is rejected with 403 when student belongs to other college", async () => {
    const instA = new mongoose.Types.ObjectId().toString();
    const instB = new mongoose.Types.ObjectId().toString();
    const teacherA = new mongoose.Types.ObjectId().toString();
    const classA = new mongoose.Types.ObjectId().toString();
    const studentB = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;

    Classroom.findById = () => ({
      _id: classA,
      institutionId: instA,
      teacherId: teacherA,
    });
    Student.findById = () => ({
      _id: studentB,
      institutionId: instB, // Student belongs to college B!
    });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
    });

    const req = {
      user: { id: teacherA, role: "teacher", institutionId: instA },
      params: { classroomId: classA },
      body: { studentId: studentB },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Cross-institution/i);
  });

  await t.test("9. Unaffiliated student (institutionId = null) is safely adopted upon valid enrollment", async () => {
    const instA = new mongoose.Types.ObjectId().toString();
    const teacherA = new mongoose.Types.ObjectId().toString();
    const classA = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindStudent = Student.findById;
    const originalFindEnrollment = Enrollment.findOne;
    const originalCreateEnrollment = Enrollment.create;

    Classroom.findById = () => ({
      _id: classA,
      institutionId: instA,
      teacherId: teacherA,
    });

    let studentSaved = false;
    const unaffiliatedStudent = {
      _id: studentId,
      name: "New Student",
      institutionId: null, // Unaffiliated!
      save: function () {
        studentSaved = true;
        return this;
      },
    };
    Student.findById = () => unaffiliatedStudent;
    Enrollment.findOne = () => null;
    Enrollment.create = (doc) => ({ _id: "new_enrollment_id", ...doc });

    t.after(() => {
      Classroom.findById = originalFindClass;
      Student.findById = originalFindStudent;
      Enrollment.findOne = originalFindEnrollment;
      Enrollment.create = originalCreateEnrollment;
    });

    const req = {
      user: { id: teacherA, role: "teacher", institutionId: instA },
      params: { classroomId: classA },
      body: { studentId: studentId },
    };
    const res = createMockRes();

    await enrollStudentInClassroom(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(studentSaved, true, "Student record must be saved with new institutionId");
    assert.strictEqual(unaffiliatedStudent.institutionId, instA, "Student must be adopted by College A");
  });

  await t.test("10. Staff can update enrollment status to 'dropped' with droppedAt timestamp", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const studentId = new mongoose.Types.ObjectId().toString();

    const originalFindClass = Classroom.findById;
    const originalFindEnrollment = Enrollment.findOne;

    Classroom.findById = () => ({
      _id: classId,
      institutionId: instId,
      teacherId: teacherId,
    });

    const activeEnrollment = {
      _id: "enrollment_id",
      classroomId: classId,
      studentId: studentId,
      status: "enrolled",
      save: function () { return this; },
    };
    Enrollment.findOne = () => activeEnrollment;

    t.after(() => {
      Classroom.findById = originalFindClass;
      Enrollment.findOne = originalFindEnrollment;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      params: { classroomId: classId, studentId: studentId },
      body: { status: "dropped" },
    };
    const res = createMockRes();

    await updateEnrollmentStatus(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(activeEnrollment.status, "dropped");
    assert.ok(activeEnrollment.droppedAt instanceof Date, "droppedAt must be set to Date");
  });
});
