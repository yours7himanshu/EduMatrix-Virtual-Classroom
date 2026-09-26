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
const {
  classifyStudentInstitution,
  generateInstitutionManifest,
} = require("../services/legacyInstitutionMigrationService");

test("Legacy Institution Migration & Authoritative Evidence Hierarchy Suite", async (t) => {
  const instAId = new mongoose.Types.ObjectId().toString();
  const instBId = new mongoose.Types.ObjectId().toString();
  const orphanedInstId = new mongoose.Types.ObjectId().toString();

  const mockInstitutions = [
    { _id: instAId, name: "Institution Alpha", centerCode: 101 },
    { _id: instBId, name: "Institution Beta", centerCode: 102 },
  ];

  const classroomA1Id = new mongoose.Types.ObjectId().toString();
  const classroomA2Id = new mongoose.Types.ObjectId().toString();
  const classroomB1Id = new mongoose.Types.ObjectId().toString();

  const mockClassrooms = [
    { _id: classroomA1Id, courseCode: "CS-101", institutionId: instAId },
    { _id: classroomA2Id, courseCode: "CS-102", institutionId: instAId },
    { _id: classroomB1Id, courseCode: "EE-201", institutionId: instBId },
  ];

  await t.test("1. Existing valid student.institutionId is preserved (Tier A)", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Enrolled Student",
      email: "student@example.com",
      institutionId: instAId,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
    });

    assert.strictEqual(res.classification, "PRESERVED");
    assert.strictEqual(res.status, "PRESERVED");
    assert.strictEqual(res.detectedInstitutionId, instAId);
    assert.strictEqual(res.canAutoMigrate, false);
    assert.match(res.classificationReason, /already possesses an authoritative/);
  });

  await t.test("2. Orphaned student.institutionId is flagged for review", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Orphaned Student",
      email: "orphan@example.com",
      institutionId: orphanedInstId,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
    });

    assert.strictEqual(res.classification, "INVALID_ORPHANED_REFERENCE");
    assert.strictEqual(res.detectedInstitutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
    assert.match(res.classificationReason, /does not exist in institutions collection/);
  });

  await t.test("3. Missing institutionId with @miet.ac.in is NOT assigned to any institution", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Legacy Student",
      email: "student22@miet.ac.in",
      branch: "CSE",
      batch: "2022-2026",
      rollNo: 2200680100001,
      institutionId: null,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: [],
    });

    assert.strictEqual(res.classification, "REQUIRES_MANUAL_ASSIGNMENT");
    assert.strictEqual(res.detectedInstitutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
    assert.match(res.classificationReason, /No valid institutionId and no active classroom enrollment/);
  });

  await t.test("4. Missing institutionId with arbitrary institutional email domain is NOT assigned", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "University Student",
      email: "user@harvard.edu",
      institutionId: null,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: [],
    });

    assert.strictEqual(res.status, "REQUIRES_INSTITUTION_ASSIGNMENT");
    assert.strictEqual(res.institutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
  });

  await t.test("5. Missing institutionId with generic email domain (@gmail.com) is NOT assigned", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Gmail User",
      email: "someone@gmail.com",
      branch: "Chemical Engineering",
      institutionId: null,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: [],
    });

    assert.strictEqual(res.status, "REQUIRES_INSTITUTION_ASSIGNMENT");
    assert.strictEqual(res.institutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
  });

  await t.test("6. Academic branch, batch, and roll number alone NEVER infer an institution", () => {
    const student = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Branch Only Student",
      email: "test@example.com",
      branch: "CSE",
      batch: "2022-2026",
      rollNo: 101,
      institutionId: null,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: [],
    });

    assert.strictEqual(res.status, "REQUIRES_INSTITUTION_ASSIGNMENT");
    assert.strictEqual(res.institutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
  });

  await t.test("7. Unambiguous active classroom enrollment deterministically identifies institution (Tier B)", () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const student = {
      _id: studentId,
      name: "Enrolled Legacy Student",
      email: "unaffiliated@gmail.com",
      institutionId: null,
    };

    const mockEnrollments = [
      { studentId, classroomId: classroomA1Id, status: "enrolled" },
      { studentId, classroomId: classroomA2Id, status: "enrolled" },
    ];

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: mockEnrollments,
    });

    assert.strictEqual(res.classification, "AUTHORITATIVE_MATCH");
    assert.strictEqual(res.status, "AUTHORITATIVE_MATCH");
    assert.strictEqual(res.detectedInstitutionId, instAId);
    assert.strictEqual(res.canAutoMigrate, true);
    assert.match(res.classificationReason, /Unambiguous active classroom enrollment/);
  });

  await t.test("8. Conflicting classroom enrollments across multiple institutions require review", () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const student = {
      _id: studentId,
      name: "Cross Enrolled Student",
      email: "cross@example.com",
      institutionId: null,
    };

    const conflictingEnrollments = [
      { studentId, classroomId: classroomA1Id, status: "enrolled" },
      { studentId, classroomId: classroomB1Id, status: "enrolled" },
    ];

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: conflictingEnrollments,
    });

    assert.strictEqual(res.classification, "CONFLICTING_EVIDENCE");
    assert.strictEqual(res.detectedInstitutionId, null);
    assert.strictEqual(res.canAutoMigrate, false);
    assert.match(res.classificationReason, /spanning multiple distinct institutions/);
  });

  await t.test("9. Dropped classroom enrollments are ignored during determination", () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const student = {
      _id: studentId,
      name: "Dropped Student",
      email: "dropped@example.com",
      institutionId: null,
    };

    const enrollmentsWithDropped = [
      { studentId, classroomId: classroomB1Id, status: "dropped" },
      { studentId, classroomId: classroomA1Id, status: "enrolled" },
    ];

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: enrollmentsWithDropped,
    });

    assert.strictEqual(res.classification, "AUTHORITATIVE_MATCH");
    assert.strictEqual(res.detectedInstitutionId, instAId);
    assert.strictEqual(res.canAutoMigrate, true);
  });

  await t.test("10. Explicit administrator-approved manifest maps student safely (Tier C)", () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const student = {
      _id: studentId,
      name: "Manually Approved Student",
      email: "manual@example.com",
      institutionId: null,
    };

    const approvedManifest = {
      [studentId]: instBId,
    };

    const res = classifyStudentInstitution(student, {
      institutions: mockInstitutions,
      classrooms: mockClassrooms,
      enrollments: [],
      approvedManifest,
    });

    assert.strictEqual(res.classification, "AUTHORITATIVE_MATCH");
    assert.strictEqual(res.detectedInstitutionId, instBId);
    assert.strictEqual(res.canAutoMigrate, true);
    assert.match(res.classificationReason, /Explicit administrator-approved institution assignment/);
  });

  await t.test("11. generateInstitutionManifest compiles summary and candidates with zero database writes", () => {
    const studentPreserved = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Preserved Student",
      email: "preserved@example.com",
      institutionId: instAId,
    };

    const studentAuthoritative = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Auth Student",
      email: "auth@example.com",
      institutionId: null,
    };

    const studentUnassigned = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: "Unassigned Student",
      email: "unassigned@miet.ac.in",
      institutionId: null,
    };

    const testEnrollments = [
      { studentId: studentAuthoritative._id, classroomId: classroomA1Id, status: "enrolled" },
    ];

    const manifest = generateInstitutionManifest(
      [studentPreserved, studentAuthoritative, studentUnassigned],
      {
        institutions: mockInstitutions,
        classrooms: mockClassrooms,
        enrollments: testEnrollments,
      }
    );

    assert.strictEqual(manifest.summary.totalStudents, 3);
    assert.strictEqual(manifest.summary.alreadyAssigned, 1);
    assert.strictEqual(manifest.summary.authoritativeMatches, 1);
    assert.strictEqual(manifest.summary.requiresManualAssignment, 1);
    assert.strictEqual(manifest.summary.conflictingEvidence, 0);
    assert.strictEqual(manifest.summary.invalidOrphanedReferences, 0);

    assert.strictEqual(manifest.candidates.length, 2);
    assert.strictEqual(manifest.allEntries.length, 3);

    // Verify candidate entries have required fields
    const cand = manifest.candidates[0];
    assert.ok(cand.studentId);
    assert.ok(cand.classification);
    assert.ok(cand.classificationReason);
    assert.ok(cand.evidenceSource);
    assert.strictEqual(typeof cand.requiresManualApproval, "boolean");
  });
});

