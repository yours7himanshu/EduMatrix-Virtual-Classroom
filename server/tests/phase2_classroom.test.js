const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const Admin = require("../models/adminModels");
const {
  createClassroom,
  getClassrooms,
  getClassroomById,
  reassignClassroomTeacher,
  updateClassroomStatus,
} = require("../controllers/classroomController");

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

test("Phase 2: Classroom Architecture & Multi-Tenant Authorization Suite", async (t) => {
  await t.test("1. Classroom schema defines required fields, indexes, and excludes roomName", () => {
    const paths = Classroom.schema.paths;
    assert.ok(paths.title, "Classroom must have title");
    assert.ok(paths.courseCode, "Classroom must have courseCode");
    assert.ok(paths.institutionId, "Classroom must have institutionId");
    assert.ok(paths.teacherId, "Classroom must have teacherId");
    assert.ok(paths.branch, "Classroom must have branch");
    assert.ok(paths.batch, "Classroom must have batch");
    assert.ok(paths.isActive, "Classroom must have isActive");
    assert.strictEqual(paths.roomName, undefined, "Classroom must NOT define roomName (LiveKit roomName belongs to LiveSession)");

    // Check unique compound index
    const indexes = Classroom.schema.indexes();
    const hasUniqueCourseCodeIndex = indexes.some(
      ([idx, opts]) => idx.institutionId === 1 && idx.courseCode === 1 && opts && opts.unique === true
    );
    assert.strictEqual(hasUniqueCourseCodeIndex, true, "Must enforce unique index on { institutionId, courseCode }");
  });

  await t.test("2. Teacher successfully creates classroom for self in their institution", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    const originalFindClassroom = Classroom.findOne;
    const originalCreate = Classroom.create;

    Admin.findById = (id) => ({
      _id: teacherId,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });
    Classroom.findOne = () => null; // No existing courseCode
    Classroom.create = (doc) => ({ _id: new mongoose.Types.ObjectId().toString(), ...doc });

    t.after(() => {
      Admin.findById = originalFindAdmin;
      Classroom.findOne = originalFindClassroom;
      Classroom.create = originalCreate;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      body: {
        title: "Algorithms 101",
        courseCode: "CS101",
        branch: "CSE",
        batch: "2024",
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.classroom.title, "Algorithms 101");
    assert.strictEqual(res.data.classroom.courseCode, "CS101");
    assert.strictEqual(res.data.classroom.teacherId, teacherId);
    assert.strictEqual(res.data.classroom.institutionId, instId);
  });

  await t.test("3. Teacher attempting to assign another teacher is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacher1Id = new mongoose.Types.ObjectId().toString();
    const teacher2Id = new mongoose.Types.ObjectId().toString();

    const req = {
      user: { id: teacher1Id, role: "teacher", institutionId: instId },
      body: {
        title: "Algorithms 101",
        courseCode: "CS101",
        branch: "CSE",
        batch: "2024",
        teacherId: teacher2Id, // Attempting to assign someone else
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /cannot create classrooms for other instructors/i);
  });

  await t.test("4. Director successfully creates classroom and assigns active Teacher in same institution", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const directorId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    const originalFindClassroom = Classroom.findOne;
    const originalCreate = Classroom.create;

    Admin.findById = (id) => {
      if (id.toString() === teacherId) {
        return { _id: teacherId, role: "Teacher", isActive: true, institutionId: instId };
      }
      return null;
    };
    Classroom.findOne = () => null;
    Classroom.create = (doc) => ({ _id: new mongoose.Types.ObjectId().toString(), ...doc });

    t.after(() => {
      Admin.findById = originalFindAdmin;
      Classroom.findOne = originalFindClassroom;
      Classroom.create = originalCreate;
    });

    const req = {
      user: { id: directorId, role: "director", institutionId: instId },
      body: {
        title: "Operating Systems",
        courseCode: "CS202",
        branch: "CSE",
        batch: "2024",
        teacherId: teacherId,
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.classroom.teacherId, teacherId);
  });

  await t.test("5. Cross-tenant assignment rejected when teacher belongs to different institution", async () => {
    const instA = new mongoose.Types.ObjectId().toString();
    const instB = new mongoose.Types.ObjectId().toString();
    const directorA = new mongoose.Types.ObjectId().toString();
    const teacherB = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    Admin.findById = (id) => {
      if (id.toString() === teacherB) {
        return { _id: teacherB, role: "Teacher", isActive: true, institutionId: instB };
      }
      return null;
    };

    t.after(() => {
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: directorA, role: "director", institutionId: instA },
      body: {
        title: "Database Systems",
        courseCode: "CS303",
        branch: "CSE",
        batch: "2024",
        teacherId: teacherB,
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /different institution/i);
  });

  await t.test("6. Assignment to inactive teacher is rejected with 400", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const directorId = new mongoose.Types.ObjectId().toString();
    const inactiveTeacherId = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    Admin.findById = () => ({
      _id: inactiveTeacherId,
      role: "Teacher",
      isActive: false, // Inactive account!
      institutionId: instId,
    });

    t.after(() => {
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: directorId, role: "director", institutionId: instId },
      body: {
        title: "Compilers",
        courseCode: "CS404",
        branch: "CSE",
        batch: "2024",
        teacherId: inactiveTeacherId,
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /inactive/i);
  });

  await t.test("7. Assignment to non-teacher staff role is rejected with 400", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const directorId = new mongoose.Types.ObjectId().toString();
    const registrarId = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    Admin.findById = () => ({
      _id: registrarId,
      role: "Registrar", // Not a teacher
      isActive: true,
      institutionId: instId,
    });

    t.after(() => {
      Admin.findById = originalFindAdmin;
    });

    const req = {
      user: { id: directorId, role: "director", institutionId: instId },
      body: {
        title: "Networks",
        courseCode: "CS505",
        branch: "CSE",
        batch: "2024",
        teacherId: registrarId,
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /must have Teacher role/i);
  });

  await t.test("8. Duplicate courseCode within same institution is rejected with 409", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const teacherId = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    const originalFindClassroom = Classroom.findOne;

    Admin.findById = () => ({
      _id: teacherId,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });
    Classroom.findOne = () => ({
      _id: "existing_class_id",
      courseCode: "CS101",
      institutionId: instId,
    });

    t.after(() => {
      Admin.findById = originalFindAdmin;
      Classroom.findOne = originalFindClassroom;
    });

    const req = {
      user: { id: teacherId, role: "teacher", institutionId: instId },
      body: {
        title: "Duplicate Course",
        courseCode: "CS101",
        branch: "CSE",
        batch: "2024",
      },
    };
    const res = createMockRes();

    await createClassroom(req, res);

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /already exists/i);
  });

  await t.test("9. Cross-institution classroom access is rejected with 403 on retrieval", async () => {
    const instA = new mongoose.Types.ObjectId().toString();
    const instB = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();

    const originalFind = Classroom.findById;
    Classroom.findById = () => ({
      populate: () => ({
        populate: () => ({
          _id: classId,
          title: "College A Class",
          institutionId: { _id: instA },
          teacherId: { _id: "teacher_a" },
        }),
      }),
    });

    t.after(() => {
      Classroom.findById = originalFind;
    });

    const req = {
      user: { id: "user_b", role: "director", institutionId: instB }, // College B caller!
      params: { id: classId },
    };
    const res = createMockRes();

    await getClassroomById(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Cross-institution/i);
  });

  await t.test("10. Director can reassign classroom to another valid teacher in same institution", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const classId = new mongoose.Types.ObjectId().toString();
    const teacher2Id = new mongoose.Types.ObjectId().toString();

    const originalFindAdmin = Admin.findById;
    const originalFindClass = Classroom.findById;

    Admin.findById = (id) => ({
      _id: id,
      role: "Teacher",
      isActive: true,
      institutionId: instId,
    });

    const mockClassroom = {
      _id: classId,
      institutionId: instId,
      teacherId: "teacher1_id",
      save: function () { return this; },
    };
    Classroom.findById = () => mockClassroom;

    t.after(() => {
      Admin.findById = originalFindAdmin;
      Classroom.findById = originalFindClass;
    });

    const req = {
      user: { id: "director_id", role: "director", institutionId: instId },
      params: { id: classId },
      body: { newTeacherId: teacher2Id },
    };
    const res = createMockRes();

    await reassignClassroomTeacher(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(mockClassroom.teacherId, teacher2Id);
  });

  await t.test("11. Teacher attempting to reassign classroom is rejected with 403", async () => {
    const instId = new mongoose.Types.ObjectId().toString();
    const req = {
      user: { id: "teacher_id", role: "teacher", institutionId: instId },
      params: { id: "some_class_id" },
      body: { newTeacherId: "new_teacher" },
    };
    const res = createMockRes();

    await reassignClassroomTeacher(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Only institutional administrators/i);
  });
});
