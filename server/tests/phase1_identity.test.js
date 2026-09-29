const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Institution = require("../models/institutionModel");
const Admin = require("../models/adminModels");
const Student = require("../models/studentModels");
const isAdminAuthenticated = require("../middlewares/adminAuth");
const { authStudent } = require("../middlewares/auth");
const authenticateUser = require("../middlewares/unifiedAuth");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_phase1_secret_12345";

test("Phase 1: Identity & Multi-Tenant Architecture Suite", async (t) => {
  await t.test("1. Institution model schema has name and centerCode with proper constraints", () => {
    const namePath = Institution.schema.paths.name;
    const codePath = Institution.schema.paths.centerCode;

    assert.ok(namePath, "Institution schema must define 'name'");
    assert.strictEqual(namePath.instance, "String");
    assert.strictEqual(namePath.isRequired, true, "Institution name must be required");

    assert.ok(codePath, "Institution schema must define 'centerCode'");
    assert.strictEqual(codePath.instance, "Number");
    assert.strictEqual(codePath.isRequired, true, "centerCode must be required");
  });

  await t.test("2. Admin model schema includes institutionId and isActive", () => {
    const instPath = Admin.schema.paths.institutionId;
    const activePath = Admin.schema.paths.isActive;

    assert.ok(instPath, "Admin schema must define 'institutionId'");
    assert.strictEqual(instPath.instance, "ObjectId");
    assert.strictEqual(instPath.options.ref, "institution");

    assert.ok(activePath, "Admin schema must define 'isActive'");
    assert.strictEqual(activePath.instance, "Boolean");
    assert.strictEqual(activePath.defaultValue, true);
  });

  await t.test("3. Student model schema includes optional institutionId", () => {
    const instPath = Student.schema.paths.institutionId;

    assert.ok(instPath, "Student schema must define 'institutionId'");
    assert.strictEqual(instPath.instance, "ObjectId");
    assert.strictEqual(instPath.options.ref, "institution");
    assert.strictEqual(instPath.isRequired, false, "institutionId must be optional on Student for safe migration");
  });

  await t.test("4. adminAuth middleware normalizes req.user from Authorization Bearer header", async () => {
    const fakeAdminId = new mongoose.Types.ObjectId().toString();
    const fakeInstId = new mongoose.Types.ObjectId().toString();

    const token = jwt.sign(
      {
        email: "prof.oak@kanto.edu",
        collegeId: fakeAdminId,
        institutionId: fakeInstId,
        role: "Teacher",
        name: "Professor Oak",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({
        json: (data) => {
          throw new Error(`Unexpected status ${code}: ${JSON.stringify(data)}`);
        },
      }),
    };

    await isAdminAuthenticated(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "next() should be called on successful admin auth");
    assert.ok(req.user, "req.user must be populated by adminAuth");
    assert.strictEqual(req.user.id, fakeAdminId);
    assert.strictEqual(req.user.institutionId, fakeInstId);
    assert.strictEqual(req.user.role, "Teacher");
    assert.strictEqual(req.user.email, "prof.oak@kanto.edu");
  });

  await t.test("5. adminAuth middleware normalizes req.user from cookies", async () => {
    const fakeAdminId = new mongoose.Types.ObjectId().toString();

    const token = jwt.sign(
      {
        email: "director@college.edu",
        collegeId: fakeAdminId,
        role: "Director",
        name: "Dr. Director",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const req = {
      headers: {},
      cookies: { token },
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({
        json: (data) => {
          throw new Error(`Unexpected status ${code}`);
        },
      }),
    };

    await isAdminAuthenticated(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, fakeAdminId);
    // When institutionId is omitted in token, defaults to collegeId
    assert.strictEqual(req.user.institutionId, fakeAdminId);
    assert.strictEqual(req.user.role, "Director");
  });

  await t.test("6. authStudent middleware normalizes req.user alongside req.studentId", () => {
    const fakeStudentId = new mongoose.Types.ObjectId().toString();
    const fakeInstId = new mongoose.Types.ObjectId().toString();

    const token = jwt.sign(
      {
        email: "ash@kanto.edu",
        userId: fakeStudentId,
        role: "student",
        name: "Ash Ketchum",
        institutionId: fakeInstId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
      body: {},
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({
        json: (data) => {
          throw new Error(`Unexpected status ${code}`);
        },
      }),
    };

    authStudent(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.studentId, fakeStudentId);
    assert.ok(req.user, "req.user must be populated on authStudent");
    assert.strictEqual(req.user.id, fakeStudentId);
    assert.strictEqual(req.user.role, "student");
    assert.strictEqual(req.user.institutionId, fakeInstId);
  });

  await t.test("7. unifiedAuth middleware accepts both Staff and Student tokens", () => {
    const staffId = new mongoose.Types.ObjectId().toString();
    const instId = new mongoose.Types.ObjectId().toString();

    const staffToken = jwt.sign(
      { email: "teacher@test.com", collegeId: staffId, institutionId: instId, role: "Teacher", name: "Teach" },
      process.env.JWT_SECRET
    );

    const reqStaff = { headers: { authorization: `Bearer ${staffToken}` } };
    let nextStaff = false;
    authenticateUser(reqStaff, {}, () => { nextStaff = true; });
    assert.strictEqual(nextStaff, true);
    assert.strictEqual(reqStaff.user.role, "teacher");
    assert.strictEqual(reqStaff.user.institutionId, instId);

    const studentId = new mongoose.Types.ObjectId().toString();
    const studentToken = jwt.sign(
      { email: "student@test.com", userId: studentId, institutionId: instId, role: "student", name: "Stud" },
      process.env.JWT_SECRET
    );

    const reqStudent = { headers: { token: studentToken } };
    let nextStudent = false;
    authenticateUser(reqStudent, {}, () => { nextStudent = true; });
    assert.strictEqual(nextStudent, true);
    assert.strictEqual(reqStudent.user.role, "student");
    assert.strictEqual(reqStudent.user.id, studentId);
  });

  await t.test("8. unifiedAuth rejects missing and invalid tokens with 401", () => {
    let statusSet = null;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonResult = data;
          },
        };
      },
    };

    // Missing token
    authenticateUser({ headers: {} }, res, () => {});
    assert.strictEqual(statusSet, 401);
    assert.strictEqual(jsonResult.success, false);

    // Invalid token
    statusSet = null;
    authenticateUser({ headers: { token: "invalid.jwt.token" } }, res, () => {});
    assert.strictEqual(statusSet, 401);
    assert.strictEqual(jsonResult.success, false);
  });
});
