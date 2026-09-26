const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Teacher = require('../models/teachersModels');
const Student = require('../models/studentModels');
const { addTeacher, teacherDetail } = require('../controllers/teacherController');
const { getStudents, getStudentById } = require('../controllers/studentController');

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

    t.after(() => {
      Teacher.findOne = originalFindOne;
    });

    const req = {
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

    t.after(() => {
      Teacher.find = originalFind;
    });

    const res = createMockRes();
    await teacherDetail({}, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.teacherDetail[0].password, undefined);
  });

  await t.test('3. Student details query excludes password hash', async () => {
    const mongoose = require('mongoose');
    const Admin = require('../models/adminModels');
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

    t.after(() => {
      Student.find = originalFind;
      Admin.findById = originalAdminFindById;
    });

    const req = {
      user: { id: registrarAdminId.toString(), role: 'Registrar', institutionId: registrarInstId.toString() },
    };
    const res = createMockRes();
    await getStudents(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.studentdetails[0].password, undefined);
  });


  await t.test('4. getStudentById excludes password hash', async () => {
    const originalFindById = Student.findById;
    Student.findById = (id) => ({
      select: (fields) => {
        assert.strictEqual(fields, '-password', 'Must exclude password from projection');
        return { _id: id, name: 'Bob', email: 'bob@college.edu' };
      },
    });

    t.after(() => {
      Student.findById = originalFindById;
    });

    const res = createMockRes();
    await getStudentById({ studentId: 'student_123', body: {} }, res);

    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.studentdetails.password, undefined);
  });
});
