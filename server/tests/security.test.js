const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Teacher = require('../models/teachersModels');
const Student = require('../models/studentModels');
const Admin = require('../models/adminModels');
const isAdminAuthenticated = require('../middlewares/adminAuth');
const { addTeacher, teacherDetail } = require('../controllers/teacherController');
const { getStudents, getStudentById } = require('../controllers/studentController');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_security_tests';

const createMockRes = () => ({
  statusCode: 200,
  data: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.data = data;
    return this;
  },
});

test('Security & Data Protection Suite (SEC-07 & PERF-03)', async (t) => {
  await t.test('1. Teacher registration rejects duplicate email', async () => {
    const originalFindOne = Teacher.findOne;
    Teacher.findOne = async (query) => {
      if (query.email === 'duplicate@college.edu') {
        return { email: 'duplicate@college.edu', name: 'Original Teacher' };
      }
      return null;
    };

    try {
      const directorInstId = new mongoose.Types.ObjectId();
      const directorAdminId = new mongoose.Types.ObjectId();

      const req = {
        user: {
          id: directorAdminId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'New Teacher Name',
          qualification: 'PhD',
          subject: 'Physics',
          experience: 5,
          email: 'duplicate@college.edu',
          password: 'Password123!',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /Teacher with this email already exists/);
    } finally {
      Teacher.findOne = originalFindOne;
    }
  });

  await t.test('2. Teacher details query excludes password hash', async () => {
    const originalFind = Teacher.find;
    Teacher.find = () => ({
      select: (fields) => {
        assert.strictEqual(fields, '-password', 'Must exclude password from projection');
        return [
          { name: 'Dr. Jane', email: 'jane@college.edu', subject: 'Math' },
        ];
      },
    });

    try {
      const res = createMockRes();
      await teacherDetail({}, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.teacherDetail[0].password, undefined);
    } finally {
      Teacher.find = originalFind;
    }
  });

  await t.test('3. Student details query excludes password hash', async () => {
    const registrarInstId = new mongoose.Types.ObjectId();
    const registrarAdminId = new mongoose.Types.ObjectId();

    const originalAdminFindById = Admin.findById;
    Admin.findById = (id) => ({
      lean: async () => ({
        _id: registrarAdminId,
        email: 'reg@college.edu',
        role: 'Registrar',
        isActive: true,
        institutionId: registrarInstId,
      }),
    });

    const originalFind = Student.find;
    Student.find = (filter) => ({
      select: (fields) => ({
        lean: async () => {
          assert.strictEqual(fields, '-password', 'Must exclude password from projection');
          return [{ name: 'Bob', email: 'bob@college.edu', rollNo: '102', institutionId: registrarInstId }];
        },
      }),
    });

    try {
      const req = {
        user: { id: registrarAdminId.toString(), role: 'Registrar', institutionId: registrarInstId.toString() },
      };
      const res = createMockRes();
      await getStudents(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.studentdetails[0].password, undefined);
    } finally {
      Student.find = originalFind;
      Admin.findById = originalAdminFindById;
    }
  });

  await t.test('4. getStudentById excludes password hash', async () => {
    const originalFindById = Student.findById;
    Student.findById = (id) => ({
      select: (fields) => {
        assert.strictEqual(fields, '-password', 'Must exclude password from projection');
        return { _id: id, name: 'Bob', email: 'bob@college.edu' };
      },
    });

    try {
      const res = createMockRes();
      await getStudentById({ studentId: 'student_123', body: {} }, res);

      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.studentdetails.password, undefined);
    } finally {
      Student.findById = originalFindById;
    }
  });
});

test('Critical Security Remediation Suite: Teacher-Creation Authorization & Tenancy', async (t) => {
  // ── Middleware Chain Tests ──────────────────────────────────────────────────
  await t.test('Route Middleware Chain: Anonymous request without token is rejected with HTTP 401', async () => {
    const req = {
      cookies: {},
      headers: {},
    };
    const res = createMockRes();
    let nextCalled = false;

    await isAdminAuthenticated(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, 'Middleware must not call next() for anonymous caller');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /not authorized/i);
  });

  await t.test('Route Middleware Chain: Invalid/tampered JWT is rejected with HTTP 401', async () => {
    const req = {
      cookies: { token: 'invalid.tampered.jwt' },
      headers: {},
    };
    const res = createMockRes();
    let nextCalled = false;

    await isAdminAuthenticated(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, 'Middleware must not call next() for invalid token');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /invalid or expired token/i);
  });

  await t.test('Route Middleware Chain: Valid Director token passes middleware and sets req.user', async () => {
    const dirId = new mongoose.Types.ObjectId().toString();
    const instId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign(
      {
        collegeId: dirId,
        institutionId: instId,
        role: 'Director',
        email: 'director@univ.edu',
        name: 'Dr. Director',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockRes();
    let nextCalled = false;

    await isAdminAuthenticated(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'Middleware must call next() for valid token');
    assert.ok(req.user, 'Middleware must attach req.user');
    assert.strictEqual(req.user.id, dirId);
    assert.strictEqual(req.user.role, 'Director');
    assert.strictEqual(req.user.institutionId, instId);
  });

  // ── Controller Authorization & Tenancy Tests ─────────────────────────────────
  await t.test('1. Anonymous request (no req.user) → HTTP 401', async () => {
    const req = {
      body: {
        name: 'Faculty Member',
        qualification: 'M.Tech',
        subject: 'Algorithms',
        experience: 4,
        email: 'faculty@univ.edu',
        password: 'Password123!',
      },
    };
    const res = createMockRes();

    await addTeacher(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Authentication is required/i);
  });

  await t.test('2. Authenticated Student → HTTP 403 Forbidden', async () => {
    const studentInstId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const req = {
      user: {
        id: studentId.toString(),
        role: 'Student',
        institutionId: studentInstId.toString(),
      },
      body: {
        name: 'Teacher Attempt',
        qualification: 'B.Tech',
        subject: 'Math',
        experience: 1,
        email: 'teacher@univ.edu',
        password: 'Password123!',
      },
    };
    const res = createMockRes();

    await addTeacher(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Only an institutional Director may create faculty/i);
  });

  await t.test('3. Authenticated Teacher → HTTP 403 Forbidden', async () => {
    const instId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();

    const req = {
      user: {
        id: teacherId.toString(),
        role: 'Teacher',
        institutionId: instId.toString(),
      },
      body: {
        name: 'Peer Faculty',
        qualification: 'M.Sc',
        subject: 'Physics',
        experience: 2,
        email: 'peer@univ.edu',
        password: 'Password123!',
      },
    };
    const res = createMockRes();

    await addTeacher(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Only an institutional Director may create faculty/i);
  });

  await t.test('4. Authenticated Registrar → HTTP 403 Forbidden', async () => {
    const instId = new mongoose.Types.ObjectId();
    const registrarId = new mongoose.Types.ObjectId();

    const req = {
      user: {
        id: registrarId.toString(),
        role: 'Registrar',
        institutionId: instId.toString(),
      },
      body: {
        name: 'Registrar Created Teacher',
        qualification: 'P.hd',
        subject: 'Chemistry',
        experience: 6,
        email: 'reg-teacher@univ.edu',
        password: 'Password123!',
      },
    };
    const res = createMockRes();

    await addTeacher(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Only an institutional Director may create faculty/i);
  });

  await t.test('5. Authorized Director with valid institutional identity → HTTP 201 Successful creation', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    const originalTeacherCreate = Teacher.create;
    const originalAdminCreate = Admin.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;

    let capturedTeacherDoc = null;
    let capturedAdminDoc = null;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;

    Teacher.create = async (doc) => {
      capturedTeacherDoc = doc;
      return {
        _id: new mongoose.Types.ObjectId(),
        ...doc,
      };
    };

    Admin.create = async (doc) => {
      capturedAdminDoc = doc;
      return {
        _id: new mongoose.Types.ObjectId(),
        ...doc,
      };
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
          collegeName: 'Apex Institute of Technology',
          centerCode: 104,
        },
        body: {
          name: 'Dr. Alan Turing',
          qualification: 'P.hd',
          subject: 'Computer Science',
          experience: 12,
          email: 'alan.turing@apex.edu',
          password: 'SuperSecretPassword!@#',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.message, 'Added teacher Successfully');
      assert.ok(res.data.teacher, 'Response must include teacher object');
      assert.strictEqual(res.data.teacher.name, 'Dr. Alan Turing');
      assert.strictEqual(res.data.teacher.email, 'alan.turing@apex.edu');
      assert.strictEqual(res.data.teacher.qualification, 'P.hd');
      assert.strictEqual(res.data.teacher.subject, 'Computer Science');
      assert.strictEqual(res.data.teacher.experience, 12);

      // Verify Teacher document was created
      assert.ok(capturedTeacherDoc);
      assert.strictEqual(capturedTeacherDoc.email, 'alan.turing@apex.edu');

      // Verify authenticable Admin record was created and bound to Director's institution
      assert.ok(capturedAdminDoc);
      assert.strictEqual(capturedAdminDoc.directorName, 'Dr. Alan Turing');
      assert.strictEqual(capturedAdminDoc.email, 'alan.turing@apex.edu');
      assert.strictEqual(capturedAdminDoc.role, 'Teacher');
      assert.strictEqual(capturedAdminDoc.collegeName, 'Apex Institute of Technology');
      assert.strictEqual(capturedAdminDoc.centerCode, 104);
      assert.strictEqual(capturedAdminDoc.institutionId.toString(), directorInstId.toString());
    } finally {
      Teacher.create = originalTeacherCreate;
      Admin.create = originalAdminCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
    }
  });

  await t.test('6. Missing or invalid institutional identity → rejected with HTTP 400', async () => {
    const directorId = new mongoose.Types.ObjectId();

    // Case A: Missing institutionId (null)
    const reqNull = {
      user: {
        id: directorId.toString(),
        role: 'Director',
        institutionId: null,
      },
      body: {
        name: 'Faculty Without Tenancy',
        qualification: 'M.Sc',
        subject: 'Physics',
        experience: 3,
        email: 'faculty.notenancy@univ.edu',
        password: 'Password123!',
      },
    };
    const resNull = createMockRes();
    await addTeacher(reqNull, resNull);

    assert.strictEqual(resNull.statusCode, 400);
    assert.strictEqual(resNull.data.success, false);
    assert.match(resNull.data.message, /not associated with an authorized institution/i);

    // Case B: Malformed institutionId
    const reqInvalid = {
      user: {
        id: directorId.toString(),
        role: 'Director',
        institutionId: 'invalid-non-object-id',
      },
      body: {
        name: 'Faculty With Bad Tenancy',
        qualification: 'M.Sc',
        subject: 'Physics',
        experience: 3,
        email: 'faculty.badtenancy@univ.edu',
        password: 'Password123!',
      },
    };
    const resInvalid = createMockRes();
    await addTeacher(reqInvalid, resInvalid);

    assert.strictEqual(resInvalid.statusCode, 400);
    assert.strictEqual(resInvalid.data.success, false);
    assert.match(resInvalid.data.message, /not associated with an authorized institution/i);
  });

  await t.test('7. Client-supplied institution ID cannot override the authenticated Director institution', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const attackerAttemptedInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    let capturedAdminDoc = null;
    const originalAdminCreate = Admin.create;
    const originalTeacherCreate = Teacher.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
    Admin.create = async (doc) => {
      capturedAdminDoc = doc;
      return { _id: new mongoose.Types.ObjectId(), ...doc };
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Jane Smith',
          qualification: 'P.hd',
          subject: 'Biotech',
          experience: 7,
          email: 'jane.smith@target.edu',
          password: 'Password123!',
          institutionId: attackerAttemptedInstId.toString(), // Attacker tries to stamp different institution
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.ok(capturedAdminDoc, 'Admin.create must have been called');
      assert.strictEqual(
        capturedAdminDoc.institutionId.toString(),
        directorInstId.toString(),
        'Admin record MUST be bound to authenticated Director institution'
      );
      assert.notStrictEqual(
        capturedAdminDoc.institutionId.toString(),
        attackerAttemptedInstId.toString(),
        'Admin record must NOT use client-supplied institutionId'
      );
    } finally {
      Admin.create = originalAdminCreate;
      Teacher.create = originalTeacherCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
    }
  });

  await t.test('8. Client-supplied role or privileged fields cannot escalate permissions', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    let capturedAdminDoc = null;
    const originalAdminCreate = Admin.create;
    const originalTeacherCreate = Teacher.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
    Admin.create = async (doc) => {
      capturedAdminDoc = doc;
      return { _id: new mongoose.Types.ObjectId(), ...doc };
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Malicious Escalation',
          qualification: 'P.hd',
          subject: 'Cybersecurity',
          experience: 10,
          email: 'escalation@target.edu',
          password: 'Password123!',
          role: 'SuperAdmin', // Attacker attempts privilege escalation
          collegeName: 'Forged College Name',
          centerCode: 999999,
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(
        capturedAdminDoc.role,
        'Teacher',
        'Created Admin record must strictly be assigned Teacher role, ignoring client body'
      );
      assert.strictEqual(
        res.data.teacher.role,
        'teacher',
        'Response teacher role must not reflect client role escalation'
      );
    } finally {
      Admin.create = originalAdminCreate;
      Teacher.create = originalTeacherCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
    }
  });

  await t.test('9. Successful response does not contain password or password hash', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    const originalTeacherCreate = Teacher.create;
    const originalAdminCreate = Admin.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
    Admin.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });

    try {
      const rawPassword = 'SuperSecretPlaintextPassword!999';
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Safe Credentials',
          qualification: 'P.hd',
          subject: 'Information Security',
          experience: 15,
          email: 'safe.cred@target.edu',
          password: rawPassword,
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.data.teacher, 'Teacher object must be present');

      // SEC-CRIT check: Neither plaintext nor hash should be present in response
      assert.strictEqual(
        res.data.teacher.password,
        undefined,
        'Response teacher object must NEVER contain password property'
      );
      assert.strictEqual(
        res.data.teacher.hashPassword,
        undefined,
        'Response teacher object must NEVER contain hashPassword'
      );

      // Verify response string serialization contains zero traces of the password
      const responseSerialized = JSON.stringify(res.data);
      assert.strictEqual(
        responseSerialized.includes(rawPassword),
        false,
        'Serialized HTTP response body must not contain plaintext password'
      );
      assert.strictEqual(
        responseSerialized.includes('$2b$'),
        false,
        'Serialized HTTP response body must not contain bcrypt hash'
      );
    } finally {
      Teacher.create = originalTeacherCreate;
      Admin.create = originalAdminCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
    }
  });

  await t.test('10. Inactive Director account is rejected with HTTP 403 Forbidden', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    const originalAdminFindById = Admin.findById;
    Admin.findById = (id) => ({
      lean: async () => ({
        _id: directorId,
        email: 'inactive.dir@univ.edu',
        role: 'Director',
        isActive: false, // Inactive account
        institutionId: directorInstId,
      }),
    });

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          isActive: false,
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Teacher Candidate',
          qualification: 'M.Tech',
          subject: 'Robotics',
          experience: 5,
          email: 'robotics@univ.edu',
          password: 'Password123!',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, /account is inactive/i);
    } finally {
      Admin.findById = originalAdminFindById;
    }
  });

  await t.test('11. Missing required fields in body rejected with HTTP 400 Bad Request', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();

    const req = {
      user: {
        id: directorId.toString(),
        role: 'Director',
        institutionId: directorInstId.toString(),
      },
      body: {
        // Missing name, password, email
        qualification: 'M.Sc',
        subject: 'Math',
      },
    };
    const res = createMockRes();

    await addTeacher(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /All fields .* are required/i);
  });

  await t.test('12. Admin creation failure triggers compensating rollback of Teacher record', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();
    const generatedTeacherId = new mongoose.Types.ObjectId();

    let capturedDeletedId = null;
    const originalTeacherCreate = Teacher.create;
    const originalAdminCreate = Admin.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;
    const originalTeacherFindByIdAndDelete = Teacher.findByIdAndDelete;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: generatedTeacherId, ...doc });
    Admin.create = async () => {
      throw new Error('SIMULATED_DB_WRITE_FAILURE');
    };
    Teacher.findByIdAndDelete = async (id) => {
      capturedDeletedId = id;
      return { _id: id };
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Failed Admin',
          qualification: 'P.hd',
          subject: 'Networks',
          experience: 8,
          email: 'failed.admin@target.edu',
          password: 'Password123!',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      // Verify Teacher document was rolled back
      assert.ok(capturedDeletedId, 'Teacher.findByIdAndDelete must be called to rollback');
      assert.strictEqual(
        capturedDeletedId.toString(),
        generatedTeacherId.toString(),
        'Rolled back Teacher ID must match the newly created Teacher document'
      );

      // Verify HTTP response is non-success
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.teacher, undefined, 'Must not return teacher object on failure');
      assert.strictEqual(res.data.message, 'Failed to create faculty account. Please try again.');

      // Verify internal error was not leaked
      const serialized = JSON.stringify(res.data);
      assert.strictEqual(serialized.includes('SIMULATED_DB_WRITE_FAILURE'), false);
    } finally {
      Teacher.create = originalTeacherCreate;
      Admin.create = originalAdminCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
      Teacher.findByIdAndDelete = originalTeacherFindByIdAndDelete;
    }
  });

  await t.test('13. Admin duplicate-email collision triggers rollback with no orphaned Teacher record', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();
    const generatedTeacherId = new mongoose.Types.ObjectId();

    let capturedDeletedId = null;
    const originalTeacherCreate = Teacher.create;
    const originalAdminCreate = Admin.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;
    const originalTeacherFindByIdAndDelete = Teacher.findByIdAndDelete;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: generatedTeacherId, ...doc });
    Admin.create = async () => {
      const dupError = new Error('E11000 duplicate key error collection: edumatrix.admins index: email_1 dup key');
      dupError.code = 11000;
      throw dupError;
    };
    Teacher.findByIdAndDelete = async (id) => {
      capturedDeletedId = id;
      return { _id: id };
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Duplicate Race',
          qualification: 'P.hd',
          subject: 'Operating Systems',
          experience: 5,
          email: 'dup.race@target.edu',
          password: 'Password123!',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      // Verify Teacher document was rolled back
      assert.ok(capturedDeletedId, 'Teacher document must be rolled back on duplicate key error');
      assert.strictEqual(capturedDeletedId.toString(), generatedTeacherId.toString());

      // Verify status is 400 and duplicate email message returned
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.teacher, undefined);
      assert.strictEqual(res.data.message, 'Teacher with this email already exists');
    } finally {
      Teacher.create = originalTeacherCreate;
      Admin.create = originalAdminCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
      Teacher.findByIdAndDelete = originalTeacherFindByIdAndDelete;
    }
  });

  await t.test('14. Rollback failure is logged safely and returns HTTP 500 without false success', async () => {
    const directorInstId = new mongoose.Types.ObjectId();
    const directorId = new mongoose.Types.ObjectId();
    const generatedTeacherId = new mongoose.Types.ObjectId();

    const originalTeacherCreate = Teacher.create;
    const originalAdminCreate = Admin.create;
    const originalTeacherFindOne = Teacher.findOne;
    const originalAdminFindOne = Admin.findOne;
    const originalTeacherFindByIdAndDelete = Teacher.findByIdAndDelete;

    Teacher.findOne = async () => null;
    Admin.findOne = async () => null;
    Teacher.create = async (doc) => ({ _id: generatedTeacherId, ...doc });
    Admin.create = async () => {
      throw new Error('PRIMARY_ADMIN_CREATE_FAILURE');
    };
    Teacher.findByIdAndDelete = async () => {
      throw new Error('SECONDARY_ROLLBACK_DELETE_FAILURE');
    };

    try {
      const req = {
        user: {
          id: directorId.toString(),
          role: 'Director',
          institutionId: directorInstId.toString(),
        },
        body: {
          name: 'Dr. Double Failure',
          qualification: 'M.Tech',
          subject: 'Compiler Design',
          experience: 4,
          email: 'double.fail@target.edu',
          password: 'Password123!',
        },
      };
      const res = createMockRes();

      await addTeacher(req, res);

      // Verify controller handles failure safely and does not report success
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.teacher, undefined, 'Must not return teacher object on rollback failure');
      assert.strictEqual(res.data.message, 'Failed to create faculty account. Please try again.');

      // Verify internal error details are not exposed to client
      const serialized = JSON.stringify(res.data);
      assert.strictEqual(serialized.includes('PRIMARY_ADMIN_CREATE_FAILURE'), false);
      assert.strictEqual(serialized.includes('SECONDARY_ROLLBACK_DELETE_FAILURE'), false);
    } finally {
      Teacher.create = originalTeacherCreate;
      Admin.create = originalAdminCreate;
      Teacher.findOne = originalTeacherFindOne;
      Admin.findOne = originalAdminFindOne;
      Teacher.findByIdAndDelete = originalTeacherFindByIdAndDelete;
    }
  });
});
