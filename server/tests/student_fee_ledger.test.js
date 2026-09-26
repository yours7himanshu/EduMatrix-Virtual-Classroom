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
const Student = require("../models/studentModels");
const FeeStructure = require("../models/feeStructureModel");
const FeesModel = require("../models/feesModel");
const StudentFeeAccount = require("../models/studentFeeAccountModel");
const {
  resolveStudentAcademicProgression,
} = require("../services/studentAcademicProgressionService");
const {
  resolveStudentFinancialSummary,
  syncStudentFeeAccountOnPayment,
  allocatePaymentChronologicalFIFO,
} = require("../services/studentFeeLedgerService");
const { getStudentFeeLedger } = require("../controllers/feeLedgerController");
const { payfees, setStripeInstance } = require("../controllers/paymentController");

const createMockRes = () => {
  return {
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
  };
};

test("Student Academic Progression Service Suite", async (t) => {
  const mockInstId = new mongoose.Types.ObjectId();

  await t.test("1. Correctly resolves progression for 4-year cohort across calendar boundary", () => {
    const student = {
      institutionId: mockInstId,
      branch: "CSE",
      batch: "2022-2026",
    };

    // Reference Date: Sept 15, 2022 -> Year 1 (Session 2022-23)
    const y1 = resolveStudentAcademicProgression(student, new Date("2022-09-15"));
    assert.strictEqual(y1.status, "RESOLVED");
    assert.strictEqual(y1.admissionYear, 2022);
    assert.strictEqual(y1.graduationYear, 2026);
    assert.strictEqual(y1.courseDuration, 4);
    assert.strictEqual(y1.currentAcademicYear, 1);
    assert.strictEqual(y1.isGraduated, false);
    assert.strictEqual(y1.assessedYears.length, 1);
    assert.strictEqual(y1.assessedYears[0].academicYear, 1);
    assert.strictEqual(y1.assessedYears[0].academicSession, "2022-23");

    // Reference Date: March 10, 2024 -> Year 2 (Session 2023-24)
    const y2 = resolveStudentAcademicProgression(student, new Date("2024-03-10"));
    assert.strictEqual(y2.status, "RESOLVED");
    assert.strictEqual(y2.currentAcademicYear, 2);
    assert.strictEqual(y2.assessedYears.length, 2);

    // Reference Date: Sept 20, 2025 -> Year 4 (Session 2025-26)
    const y4 = resolveStudentAcademicProgression(student, new Date("2025-09-20"));
    assert.strictEqual(y4.status, "RESOLVED");
    assert.strictEqual(y4.currentAcademicYear, 4);
    assert.strictEqual(y4.assessedYears.length, 4);
    assert.deepStrictEqual(
      y4.assessedYears.map((y) => y.academicYear),
      [1, 2, 3, 4]
    );

    // Reference Date: Sept 20, 2027 -> Graduated, clamped to Year 4
    const grad = resolveStudentAcademicProgression(student, new Date("2027-09-20"));
    assert.strictEqual(grad.status, "RESOLVED");
    assert.strictEqual(grad.currentAcademicYear, 4);
    assert.strictEqual(grad.isGraduated, true);
  });

  await t.test("2. Rejects student with missing institutionId with UNRESOLVED", () => {
    const student = {
      institutionId: null,
      branch: "CSE",
      batch: "2022-2026",
    };
    const res = resolveStudentAcademicProgression(student);
    assert.strictEqual(res.status, "UNRESOLVED");
    assert.match(res.reason, /active institution/i);
  });

  await t.test("3. Rejects student with missing branch with UNRESOLVED", () => {
    const student = {
      institutionId: mockInstId,
      branch: "",
      batch: "2022-2026",
    };
    const res = resolveStudentAcademicProgression(student);
    assert.strictEqual(res.status, "UNRESOLVED");
    assert.match(res.reason, /branch/i);
  });

  await t.test("4. Rejects malformed or non-standard batch format with UNRESOLVED", () => {
    const student = {
      institutionId: mockInstId,
      branch: "CSE",
      batch: "Cohort2022",
    };
    const res = resolveStudentAcademicProgression(student);
    assert.strictEqual(res.status, "UNRESOLVED");
    assert.match(res.reason, /batch/i);
  });

  await t.test("5. Multi-institution academic calendars: College A (Aug 1), College B (Jan 1), College C (Sep 1)", () => {
    const student = {
      institutionId: mockInstId,
      branch: "CSE",
      batch: "2022-2026",
    };

    // College A: Session starts August 1 (Month 8)
    const calCollegeA = { sessionStartMonth: 8, sessionStartDay: 1 };
    // Date July 20, 2025 -> Month 7 < 8 -> Still Session 2024-25 (Year 3)
    const pA1 = resolveStudentAcademicProgression(student, {
      currentDate: new Date("2025-07-20"),
      academicCalendar: calCollegeA,
    });
    assert.strictEqual(pA1.currentAcademicYear, 3);
    assert.strictEqual(pA1.currentSessionLabel, "2024-25");

    // Date August 1, 2025 -> Month 8 >= 8 -> New Session 2025-26 begins (Year 4)
    const pA2 = resolveStudentAcademicProgression(student, {
      currentDate: new Date("2025-08-01"),
      academicCalendar: calCollegeA,
    });
    assert.strictEqual(pA2.currentAcademicYear, 4);
    assert.strictEqual(pA2.currentSessionLabel, "2025-26");

    // College B: Session starts January 1 (Month 1, Calendar Year)
    const calCollegeB = { sessionStartMonth: 1, sessionStartDay: 1 };
    // Date February 15, 2025 -> Month 2 >= 1 -> Session 2025 (Year 4)
    const pB = resolveStudentAcademicProgression(student, {
      currentDate: new Date("2025-02-15"),
      academicCalendar: calCollegeB,
    });
    assert.strictEqual(pB.currentAcademicYear, 4);

    // College C: Session starts September 1 (Month 9)
    const calCollegeC = { sessionStartMonth: 9, sessionStartDay: 1 };
    // Date August 20, 2025 -> Month 8 < 9 -> Still Year 3
    const pC1 = resolveStudentAcademicProgression(student, {
      currentDate: new Date("2025-08-20"),
      academicCalendar: calCollegeC,
    });
    assert.strictEqual(pC1.currentAcademicYear, 3);
    // Date September 5, 2025 -> Month 9 >= 9 -> Year 4 begins
    const pC2 = resolveStudentAcademicProgression(student, {
      currentDate: new Date("2025-09-05"),
      academicCalendar: calCollegeC,
    });
    assert.strictEqual(pC2.currentAcademicYear, 4);
  });

  await t.test("6. Boundary condition: Graduated student cohort clamped to courseDuration with isGraduated=true", () => {
    const student = {
      institutionId: mockInstId,
      branch: "CSE",
      batch: "2020-2024",
    };
    const res = resolveStudentAcademicProgression(student, new Date("2026-09-20"));
    assert.strictEqual(res.status, "RESOLVED");
    assert.strictEqual(res.currentAcademicYear, 4);
    assert.strictEqual(res.isGraduated, true);
    assert.strictEqual(res.assessedYears.length, 4);
  });

  await t.test("7. Boundary condition: Pre-session admission clamped to Year 1", () => {
    const student = {
      institutionId: mockInstId,
      branch: "CSE",
      batch: "2026-2030",
    };
    const res = resolveStudentAcademicProgression(student, new Date("2026-05-10"));
    assert.strictEqual(res.status, "RESOLVED");
    assert.strictEqual(res.currentAcademicYear, 1);
    assert.strictEqual(res.isGraduated, false);
    assert.strictEqual(res.assessedYears.length, 1);
  });
});

test("Student Fee Ledger & Financial Summary Calculation Suite", async (t) => {
  const instId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();

  // Test fixtures
  const studentDoc = {
    _id: studentId,
    name: "Himanshu Dinkar",
    rollNo: 220080100159,
    branch: "CSE",
    batch: "2022-2026",
    email: "himanshu@example.com",
    institutionId: instId,
  };

  const feeStructures = {
    1: { tuitionFee: 150000, additionalFee: 2000, currency: "inr" },
    2: { tuitionFee: 150000, additionalFee: 2000, currency: "inr" },
    3: { tuitionFee: 150000, additionalFee: 2000, currency: "inr" },
    4: { tuitionFee: 150000, additionalFee: 2000, currency: "inr" },
  };

  // Mock Student.findById
  const originalStudentFindById = Student.findById;
  Student.findById = (id) => {
    const doc = id && id.toString() === studentId.toString() ? studentDoc : null;
    return {
      ...doc,
      lean: async () => doc,
      then(resolve, reject) {
        return Promise.resolve(doc).then(resolve, reject);
      },
    };
  };

  // Mock FeeStructure.findOne
  const originalFeeFindOne = FeeStructure.findOne;
  FeeStructure.findOne = (query) => {
    const year = query.academicYear;
    const fs = feeStructures[year];
    const doc = fs
      ? {
          _id: new mongoose.Types.ObjectId(),
          institutionId: instId,
          branch: query.branch,
          academicYear: year,
          tuitionFee: fs.tuitionFee,
          additionalFee: fs.additionalFee,
          currency: fs.currency,
          components: [
            { code: "TUITION", name: "Tuition & Instruction", amount: fs.tuitionFee },
            { code: "ADMIN_LAB", name: "Additional Administrative & Lab Fees", amount: fs.additionalFee },
          ],
        }
      : null;
    return {
      ...doc,
      lean: async () => doc,
      then(resolve, reject) {
        return Promise.resolve(doc).then(resolve, reject);
      },
    };
  };

  // Mock StudentFeeAccount.findOne
  const originalAccountFindOne = StudentFeeAccount.findOne;
  StudentFeeAccount.findOne = () => ({
    lean: async () => null,
  });

  // Mock FeesModel.find
  let mockPayments = [];
  const originalFeesFind = FeesModel.find;
  FeesModel.find = (query) => ({
    lean: async () => {
      return mockPayments.filter(
        (p) =>
          p.studentId.toString() === query.studentId.toString() &&
          p.year === query.year &&
          p.status === query.status
      );
    },
  });

  t.after(() => {
    Student.findById = originalStudentFindById;
    FeeStructure.findOne = originalFeeFindOne;
    StudentFeeAccount.findOne = originalAccountFindOne;
    FeesModel.find = originalFeesFind;
  });

  await t.test("1. Unpaid student: Calculates 4 years assessed, 0 paid, and separates current vs previous dues", async () => {
    mockPayments = [];
    // Date: September 2025 -> Year 4 of 2022-2026 cohort
    const summary = await resolveStudentFinancialSummary(studentId, new Date("2025-09-15"));

    assert.strictEqual(summary.success, true);
    assert.strictEqual(summary.status, "RESOLVED");
    assert.strictEqual(summary.academicProgression.currentAcademicYear, 4);

    // Each year is 150000 + 2000 = 152000
    assert.strictEqual(summary.financialSummary.totalAssessed, 608000);
    assert.strictEqual(summary.financialSummary.totalPaid, 0);
    assert.strictEqual(summary.financialSummary.outstandingBalance, 608000);
    assert.strictEqual(summary.financialSummary.status, "UNPAID");

    // Current Year (Year 4)
    assert.strictEqual(summary.financialSummary.currentYearFee, 152000);
    assert.strictEqual(summary.financialSummary.currentYearDue, 152000);

    // Previous Years (Years 1, 2, 3)
    assert.strictEqual(summary.financialSummary.previousYearsFee, 456000);
    assert.strictEqual(summary.financialSummary.previousYearsDue, 456000);

    // 4 yearly breakdowns
    assert.strictEqual(summary.years.length, 4);
    assert.strictEqual(summary.years[0].academicYear, 1);
    assert.strictEqual(summary.years[0].status, "UNPAID");
    assert.strictEqual(summary.years[3].isCurrentYear, true);
  });

  await t.test("2. Partially paid student: Year 1 & 2 fully paid, Year 3 partially paid, Year 4 unpaid", async () => {
    mockPayments = [
      { studentId, year: 1, amount: 152000, status: "paid" },
      { studentId, year: 2, amount: 152000, status: "paid" },
      { studentId, year: 3, amount: 50000, status: "paid" },
    ];

    const summary = await resolveStudentFinancialSummary(studentId, new Date("2025-09-15"));
    assert.strictEqual(summary.financialSummary.totalAssessed, 608000);
    assert.strictEqual(summary.financialSummary.totalPaid, 354000);
    assert.strictEqual(summary.financialSummary.outstandingBalance, 254000);
    assert.strictEqual(summary.financialSummary.status, "PARTIALLY_PAID");

    // Year 1: Paid
    assert.strictEqual(summary.years[0].status, "PAID");
    assert.strictEqual(summary.years[0].dueAmount, 0);

    // Year 2: Paid
    assert.strictEqual(summary.years[1].status, "PAID");
    assert.strictEqual(summary.years[1].dueAmount, 0);

    // Year 3: Partially paid (152000 - 50000 = 102000 due)
    assert.strictEqual(summary.years[2].status, "PARTIALLY_PAID");
    assert.strictEqual(summary.years[2].dueAmount, 102000);

    // Year 4: Current year unpaid (152000 due)
    assert.strictEqual(summary.years[3].status, "UNPAID");
    assert.strictEqual(summary.years[3].dueAmount, 152000);

    // Previous years dues = 0 + 0 + 102000 = 102000
    assert.strictEqual(summary.financialSummary.previousYearsDue, 102000);
    // Current year due = 152000
    assert.strictEqual(summary.financialSummary.currentYearDue, 152000);
  });

  await t.test("3. Zero-Due student: All 4 years fully paid", async () => {
    mockPayments = [
      { studentId, year: 1, amount: 152000, status: "paid" },
      { studentId, year: 2, amount: 152000, status: "paid" },
      { studentId, year: 3, amount: 152000, status: "paid" },
      { studentId, year: 4, amount: 152000, status: "paid" },
    ];

    const summary = await resolveStudentFinancialSummary(studentId, new Date("2025-09-15"));
    assert.strictEqual(summary.financialSummary.totalAssessed, 608000);
    assert.strictEqual(summary.financialSummary.totalPaid, 608000);
    assert.strictEqual(summary.financialSummary.outstandingBalance, 0);
    assert.strictEqual(summary.financialSummary.status, "PAID");
    assert.strictEqual(summary.financialSummary.currentYearDue, 0);
    assert.strictEqual(summary.financialSummary.previousYearsDue, 0);
  });

  await t.test("4. Controller getStudentFeeLedger returns 200 with full financial ledger", async () => {
    const req = { studentId };
    const res = createMockRes();

    await getStudentFeeLedger(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.student.name, "Himanshu Dinkar");
    assert.strictEqual(res.data.financialSummary.totalAssessed, 608000);
  });

  await t.test("5. Controller rejects unauthenticated call with 401", async () => {
    const req = { studentId: null };
    const res = createMockRes();

    await getStudentFeeLedger(req, res);
    assert.strictEqual(res.statusCode, 401);
  });

  await t.test("6. Arrears Precedence: payfees blocks payment for Year 2 when Year 1 has outstanding dues", async () => {
    mockPayments = []; // Year 1 has 0 payments, so Year 1 has 152000 dues

    setStripeInstance({
      checkout: {
        sessions: {
          create: async () => ({ id: "mock_session", url: "https://stripe.com/pay" }),
        },
      },
    });

    const originalReadyState = mongoose.connection ? mongoose.connection.readyState : 0;
    if (mongoose.connection) {
      mongoose.connection.readyState = 1;
    }

    const req = {
      studentId,
      body: { year: 2 },
    };
    const res = createMockRes();

    await payfees(req, res);

    if (mongoose.connection) {
      mongoose.connection.readyState = originalReadyState;
    }

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Prior academic year 1 has outstanding arrears/i);
  });

  await t.test("7. Unconfigured fee structure: Returns status NOT_ASSESSED with feeStructuresConfiguredCount=0 and clear explanation", async () => {
    mockPayments = [];
    const origFeeFindOne = FeeStructure.findOne;
    // Simulate no fee structures configured in the institution
    FeeStructure.findOne = () => ({
      lean: async () => null,
      then(resolve, reject) {
        return Promise.resolve(null).then(resolve, reject);
      },
    });

    try {
      const summary = await resolveStudentFinancialSummary(studentId, new Date("2025-09-15"));
      assert.strictEqual(summary.success, true);
      assert.strictEqual(summary.status, "RESOLVED");
      assert.strictEqual(summary.financialSummary.status, "NOT_ASSESSED");
      assert.strictEqual(summary.financialSummary.totalAssessed, 0);
      assert.strictEqual(summary.financialSummary.outstandingBalance, 0);
      assert.strictEqual(summary.financialSummary.feeStructuresConfiguredCount, 0);
      assert.match(summary.financialSummary.explainability.summaryText, /Fee structure has not been configured/i);
      assert.ok(summary.years.every((y) => y.status === "NOT_ASSESSED" && !y.feeStructureConfigured));
    } finally {
      FeeStructure.findOne = origFeeFindOne;
    }
  });

  await t.test("8. Partially configured fee structures: Unconfigured years marked NOT_ASSESSED, configured years assessed", async () => {
    mockPayments = [];
    const origFeeFindOne = FeeStructure.findOne;
    // Configure only Year 1, leave Years 2, 3, 4 unconfigured
    FeeStructure.findOne = (query) => {
      const year = query.academicYear;
      const fs = year === 1 ? feeStructures[1] : null;
      const doc = fs
        ? {
            _id: new mongoose.Types.ObjectId(),
            institutionId: instId,
            branch: query.branch,
            academicYear: year,
            tuitionFee: fs.tuitionFee,
            additionalFee: fs.additionalFee,
            currency: fs.currency,
            components: [
              { code: "TUITION", name: "Tuition & Instruction", amount: fs.tuitionFee },
              { code: "ADMIN_LAB", name: "Additional Administrative & Lab Fees", amount: fs.additionalFee },
            ],
          }
        : null;
      return {
        ...doc,
        lean: async () => doc,
        then(resolve, reject) {
          return Promise.resolve(doc).then(resolve, reject);
        },
      };
    };

    try {
      const summary = await resolveStudentFinancialSummary(studentId, new Date("2025-09-15"));
      assert.strictEqual(summary.success, true);
      assert.strictEqual(summary.financialSummary.feeStructuresConfiguredCount, 1);
      assert.strictEqual(summary.financialSummary.totalAssessed, 152000);
      assert.strictEqual(summary.financialSummary.outstandingBalance, 152000);
      assert.strictEqual(summary.financialSummary.status, "UNPAID");

      // Year 1 is assessed & unpaid
      assert.strictEqual(summary.years[0].academicYear, 1);
      assert.strictEqual(summary.years[0].status, "UNPAID");
      assert.strictEqual(summary.years[0].feeStructureConfigured, true);

      // Year 2 is unconfigured & not assessed
      assert.strictEqual(summary.years[1].academicYear, 2);
      assert.strictEqual(summary.years[1].status, "NOT_ASSESSED");
      assert.strictEqual(summary.years[1].feeStructureConfigured, false);
    } finally {
      FeeStructure.findOne = origFeeFindOne;
    }
  });
});

test("Multi-Year Payment Allocation (FIFO Waterfall) Suite", async (t) => {
  await t.test("1. Allocates ₹200,000 across 4 years (Year 1: 150k, Year 2: 150k, Year 3: 100k, Year 4: 150k) strictly oldest-first", () => {
    const assessedYears = [
      { academicYear: 1, dueAmount: 150000 },
      { academicYear: 2, dueAmount: 150000 },
      { academicYear: 3, dueAmount: 100000 },
      { academicYear: 4, dueAmount: 150000 },
    ];

    const result = allocatePaymentChronologicalFIFO(assessedYears, 200000);

    assert.strictEqual(result.unallocatedAmount, 0);
    assert.strictEqual(result.allocations.length, 4);

    // Year 1: 150,000 settled in full
    assert.strictEqual(result.allocations[0].academicYear, 1);
    assert.strictEqual(result.allocations[0].allocatedAmount, 150000);
    assert.strictEqual(result.allocations[0].remainingDue, 0);
    assert.strictEqual(result.allocations[0].status, "PAID");

    // Year 2: 50,000 allocated, 100,000 remaining
    assert.strictEqual(result.allocations[1].academicYear, 2);
    assert.strictEqual(result.allocations[1].allocatedAmount, 50000);
    assert.strictEqual(result.allocations[1].remainingDue, 100000);
    assert.strictEqual(result.allocations[1].status, "PARTIALLY_PAID");

    // Year 3: 0 allocated, 100,000 remaining
    assert.strictEqual(result.allocations[2].academicYear, 3);
    assert.strictEqual(result.allocations[2].allocatedAmount, 0);
    assert.strictEqual(result.allocations[2].remainingDue, 100000);
    assert.strictEqual(result.allocations[2].status, "UNPAID");

    // Year 4: 0 allocated, 150,000 remaining
    assert.strictEqual(result.allocations[3].academicYear, 4);
    assert.strictEqual(result.allocations[3].allocatedAmount, 0);
    assert.strictEqual(result.allocations[3].remainingDue, 150000);
    assert.strictEqual(result.allocations[3].status, "UNPAID");
  });

  await t.test("2. Partial payment on single year", () => {
    const assessedYears = [
      { academicYear: 1, dueAmount: 150000 },
    ];
    const result = allocatePaymentChronologicalFIFO(assessedYears, 60000);
    assert.strictEqual(result.allocations[0].allocatedAmount, 60000);
    assert.strictEqual(result.allocations[0].remainingDue, 90000);
    assert.strictEqual(result.allocations[0].status, "PARTIALLY_PAID");
    assert.strictEqual(result.unallocatedAmount, 0);
  });

  await t.test("3. Overpayment allocation preserves excess as unallocated advance credit", () => {
    const assessedYears = [
      { academicYear: 1, dueAmount: 150000 },
      { academicYear: 2, dueAmount: 100000 },
    ];
    const result = allocatePaymentChronologicalFIFO(assessedYears, 300000);
    assert.strictEqual(result.allocations[0].remainingDue, 0);
    assert.strictEqual(result.allocations[0].status, "PAID");
    assert.strictEqual(result.allocations[1].remainingDue, 0);
    assert.strictEqual(result.allocations[1].status, "PAID");
    assert.strictEqual(result.unallocatedAmount, 50000);
  });
});
