const test = require('node:test');
const assert = require('node:assert');

const Admin = require('../models/adminModels');
const User = require('../models/userModels');
const Student = require('../models/studentModels');
const FeesModel = require('../models/feesModel');
const Message = require('../models/messageModel');
const StudentMarksAttendance = require('../models/student_marks_attendance');
const Assignment = require('../models/assignmentModels');
const Teacher = require('../models/teachersModels');

test('Database Index & Schema Integrity Suite (DB-01)', async (t) => {
  await t.test('1. Admin schema enforces unique and indexed email', () => {
    const emailPath = Admin.schema.paths.email;
    assert.ok(emailPath);
    assert.strictEqual(emailPath.options.required, true);
    assert.strictEqual(emailPath.options.unique, true);
    assert.strictEqual(emailPath.options.index, true);
  });

  await t.test('2. User schema enforces unique and indexed email', () => {
    const emailPath = User.schema.paths.email;
    assert.ok(emailPath);
    assert.strictEqual(emailPath.options.required, true);
    assert.strictEqual(emailPath.options.unique, true);
    assert.strictEqual(emailPath.options.index, true);
  });

  await t.test('3. Student schema indexes rollNo and enforces unique email', () => {
    const rollNoPath = Student.schema.paths.rollNo;
    const emailPath = Student.schema.paths.email;
    assert.ok(rollNoPath);
    assert.strictEqual(rollNoPath.options.index, true);
    assert.ok(emailPath);
    assert.strictEqual(emailPath.options.unique, true);
  });

  await t.test('4. Fees schema indexes studentId, email, and stripeSessionId', () => {
    const sIdPath = FeesModel.schema.paths.studentId;
    const emailPath = FeesModel.schema.paths.email;
    const sessionPath = FeesModel.schema.paths.stripeSessionId;

    assert.ok(sIdPath);
    assert.strictEqual(sIdPath.options.index, true);
    assert.ok(emailPath);
    assert.strictEqual(emailPath.options.index, true);
    assert.ok(sessionPath);
    assert.strictEqual(sessionPath.options.index, true);
  });

  await t.test('5. Message schema indexes timestamp for efficient ordering', () => {
    const timePath = Message.schema.paths.timestamp;
    assert.ok(timePath);
    assert.strictEqual(timePath.options.index, true);
  });

  await t.test('6. StudentMarksAttendance indexes RollNumber', () => {
    const rollPath = StudentMarksAttendance.schema.paths.RollNumber;
    assert.ok(rollPath);
    assert.strictEqual(rollPath.options.index, true);
  });

  await t.test('7. Assignment schema indexes deadline', () => {
    const deadlinePath = Assignment.schema.paths.deadline;
    assert.ok(deadlinePath);
    assert.strictEqual(deadlinePath.options.index, true);
  });

  await t.test('8. Teacher schema enforces unique email', () => {
    const emailPath = Teacher.schema.paths.email;
    assert.ok(emailPath);
    assert.strictEqual(emailPath.options.unique, true);
  });
});
