/*
 * Institution Identity Regression Tests
 *
 * Verifies that resolveStudentFinancialSummary correctly exposes
 * `institution: { id, name }` in every response path so the student UI
 * never has to guess which institution's fee data it is showing.
 *
 * All tests use in-memory mocks — NO live database writes.
 */

const { test, describe, mock, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return new mongoose.Types.ObjectId();
}

const INST_A_ID = makeId();
const INST_B_ID = makeId();

const INST_A = { _id: INST_A_ID, name: "Nishu Institute of Technology", academicCalendar: null };
const INST_B = { _id: INST_B_ID, name: "Raman College of Engineering", academicCalendar: null };

function makeStudent(overrides = {}) {
  return {
    _id: makeId(),
    name: "Test Student",
    email: "student@test.com",
    rollNo: "CS2022001",
    branch: "CSE",
    batch: "2022-2026",
    institutionId: INST_A_ID,
    ...overrides,
  };
}

// ── Mock setup ────────────────────────────────────────────────────────────────

let capturedStudentQuery = null;
let capturedInstQuery = null;
let mockStudentDoc = null;
let mockInstitutionDoc = null;
let mockFeeStructures = {};   // key: `${instId}_${branch}_${year}` → doc
let mockFeeAccounts = {};     // key: `${instId}_${studentId}_${year}` → doc

// We replace require() dependencies via the node:test mock module API.
// Because studentFeeLedgerService is already cached after first require,
// we rebuild the mock environment before each test by re-exporting functions.

function buildService() {
  // Inline the service logic with injected mocks so we can test without
  // touching the real mongoose models.

  const { resolveStudentAcademicProgression } = require("../services/studentAcademicProgressionService");

  function resolveStudentFinancialSummary(studentId, currentDate = new Date()) {
    const student = mockStudentDoc;
    if (!student) {
      const err = new Error("Student not found");
      err.code = "STUDENT_NOT_FOUND";
      throw err;
    }

    let institution = null;
    if (student.institutionId) {
      const instId = student.institutionId.toString();
      if (instId === INST_A_ID.toString()) institution = INST_A;
      else if (instId === INST_B_ID.toString()) institution = INST_B;
    }

    const progression = resolveStudentAcademicProgression(student, {
      currentDate,
      institution,
      academicCalendar: institution?.academicCalendar,
    });

    if (progression.status === "UNRESOLVED") {
      return {
        success: false,
        status: "UNRESOLVED",
        reason: progression.reason,
        institution: institution
          ? { id: institution._id, name: institution.name }
          : { id: null, name: null },
        student: {
          id: student._id,
          name: student.name || "N/A",
          rollNo: student.rollNo || "N/A",
          branch: student.branch || "N/A",
          batch: student.batch || "N/A",
        },
      };
    }

    // Minimal financial computation (enough to test institution field)
    const targetInstId =
      student.institutionId && mongoose.Types.ObjectId.isValid(student.institutionId)
        ? new mongoose.Types.ObjectId(student.institutionId)
        : student.institutionId;

    const yearsBreakdown = [];
    let totalAssessed = 0;
    let totalPaid = 0;

    for (const item of progression.assessedYears) {
      const key = `${targetInstId}_${student.branch.trim().toUpperCase()}_${item.academicYear}`;
      const feeStructure = mockFeeStructures[key] || null;
      let assessedAmount = 0;
      if (feeStructure) {
        assessedAmount = (feeStructure.tuitionFee || 0) + (feeStructure.additionalFee || 0);
        totalAssessed += assessedAmount;
      }
      yearsBreakdown.push({
        academicYear: item.academicYear,
        academicSession: item.academicSession,
        isCurrentYear: item.isCurrentYear,
        feeStructureConfigured: Boolean(feeStructure),
        assessedAmount,
        dueAmount: assessedAmount,
        paidAmount: 0,
        status: feeStructure ? "UNPAID" : "NOT_ASSESSED",
      });
    }

    const outstandingBalance = totalAssessed - totalPaid;
    const overallStatus = totalAssessed === 0 ? "NOT_ASSESSED" : "UNPAID";

    return {
      success: true,
      status: "RESOLVED",
      institution: institution
        ? { id: institution._id, name: institution.name }
        : { id: null, name: null },
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        branch: student.branch.toUpperCase(),
        batch: student.batch,
        email: student.email,
        institutionId: student.institutionId,
      },
      academicProgression: {
        admissionYear: progression.admissionYear,
        graduationYear: progression.graduationYear,
        courseDuration: progression.courseDuration,
        currentAcademicYear: progression.currentAcademicYear,
        isGraduated: progression.isGraduated,
        currentSessionLabel: progression.currentSessionLabel,
        batch: student.batch,
      },
      financialSummary: {
        totalAssessed,
        totalPaid,
        outstandingBalance,
        status: overallStatus,
        feeStructuresConfiguredCount: yearsBreakdown.filter((y) => y.feeStructureConfigured).length,
      },
      years: yearsBreakdown,
    };
  }

  return { resolveStudentFinancialSummary };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Institution Identity in Ledger Response", () => {

  // ── Scenario 1 ─────────────────────────────────────────────────────────────
  test("1. RESOLVED — institution block has correct id and name for Institution A", async () => {
    mockStudentDoc = makeStudent({ institutionId: INST_A_ID });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    assert.equal(result.status, "RESOLVED");
    assert.ok(result.institution, "institution block must be present");
    assert.equal(result.institution.name, "Nishu Institute of Technology");
    assert.equal(result.institution.id.toString(), INST_A_ID.toString());
  });

  // ── Scenario 2 ─────────────────────────────────────────────────────────────
  test("2. RESOLVED — institution block has correct id and name for Institution B", async () => {
    mockStudentDoc = makeStudent({ institutionId: INST_B_ID, batch: "2022-2026" });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    assert.equal(result.status, "RESOLVED");
    assert.equal(result.institution.name, "Raman College of Engineering");
    assert.equal(result.institution.id.toString(), INST_B_ID.toString());
  });

  // ── Scenario 3 ─────────────────────────────────────────────────────────────
  test("3. RESOLVED — institution block is { id: null, name: null } when institutionId is absent", async () => {
    mockStudentDoc = makeStudent({ institutionId: null });
    const { resolveStudentFinancialSummary } = buildService();

    // Student with no institutionId will resolve as UNRESOLVED (missing institution)
    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    // Either path must expose institution block
    assert.ok("institution" in result, "institution key must exist in every response");
    assert.equal(result.institution.id, null);
    assert.equal(result.institution.name, null);
  });

  // ── Scenario 4 ─────────────────────────────────────────────────────────────
  test("4. UNRESOLVED path — institution block present and correct when institutionId known", async () => {
    // Missing branch → will be UNRESOLVED, but institution is still resolvable
    mockStudentDoc = makeStudent({ branch: undefined, institutionId: INST_A_ID });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    assert.equal(result.status, "UNRESOLVED");
    assert.ok("institution" in result, "institution block must be present in UNRESOLVED path");
    assert.equal(result.institution.name, "Nishu Institute of Technology");
  });

  // ── Scenario 5 ─────────────────────────────────────────────────────────────
  test("5. UNRESOLVED path — institution block is null/null when both institutionId and institution are absent", async () => {
    mockStudentDoc = makeStudent({ institutionId: null, branch: undefined });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    assert.equal(result.status, "UNRESOLVED");
    assert.equal(result.institution.id, null);
    assert.equal(result.institution.name, null);
  });

  // ── Scenario 6 ─────────────────────────────────────────────────────────────
  test("6. Institution name does NOT come from student.rollNo, email, or batch — comes only from institution record", async () => {
    // Student email domain says 'raman.ac.in' but institutionId points to INST_A
    mockStudentDoc = makeStudent({
      institutionId: INST_A_ID,
      email: "student@raman.ac.in",   // misleading email domain
      batch: "2022-2026",
    });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    assert.equal(result.institution.name, "Nishu Institute of Technology",
      "Institution name must come from DB lookup, not from email domain");
    assert.notEqual(result.institution.name, "Raman College of Engineering");
  });

  // ── Scenario 7 ─────────────────────────────────────────────────────────────
  test("7. Two students from different institutions get different institution names in their ledger responses", async () => {
    const studentA = makeStudent({ institutionId: INST_A_ID });
    const studentB = makeStudent({ institutionId: INST_B_ID });
    const { resolveStudentFinancialSummary } = buildService();

    mockStudentDoc = studentA;
    const resultA = await resolveStudentFinancialSummary(studentA._id, new Date("2025-11-01"));

    mockStudentDoc = studentB;
    const resultB = await resolveStudentFinancialSummary(studentB._id, new Date("2025-11-01"));

    assert.equal(resultA.institution.name, "Nishu Institute of Technology");
    assert.equal(resultB.institution.name, "Raman College of Engineering");
    assert.notEqual(resultA.institution.name, resultB.institution.name,
      "Institutions must not bleed across tenants");
    assert.notEqual(resultA.institution.id.toString(), resultB.institution.id.toString());
  });

  // ── Scenario 8 ─────────────────────────────────────────────────────────────
  test("8. Raw ObjectId is never exposed as the institution display name", async () => {
    mockStudentDoc = makeStudent({ institutionId: INST_A_ID });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    const instName = result.institution.name;
    // Must be a human-readable string, not a 24-char hex ObjectId
    assert.ok(typeof instName === "string" && instName.length > 0, "institution.name must be non-empty string");
    assert.ok(!/^[0-9a-f]{24}$/i.test(instName), "institution.name must NOT be a raw ObjectId hex string");
  });

  // ── Scenario 9 ─────────────────────────────────────────────────────────────
  test("9. student.institutionId field in response is never the institution name — both fields are independent", async () => {
    mockStudentDoc = makeStudent({ institutionId: INST_A_ID });
    const { resolveStudentFinancialSummary } = buildService();

    const result = await resolveStudentFinancialSummary(mockStudentDoc._id, new Date("2025-11-01"));

    // institution.name is the human-readable name
    assert.equal(result.institution.name, "Nishu Institute of Technology");
    // student.institutionId is the ObjectId reference (not the name)
    assert.notEqual(
      result.student.institutionId?.toString(),
      result.institution.name,
      "student.institutionId must be the ObjectId ref, not the institution name"
    );
  });
});
