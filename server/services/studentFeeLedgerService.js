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

const mongoose = require("mongoose");
const Student = require("../models/studentModels");
const Institution = require("../models/institutionModel");
const FeeStructure = require("../models/feeStructureModel");
const FeesModel = require("../models/feesModel");
const StudentFeeAccount = require("../models/studentFeeAccountModel");
const { resolveStudentAcademicProgression } = require("./studentAcademicProgressionService");

/**
 * Resolves the complete authoritative financial summary and yearly ledger for a student.
 *
 * @param {string|mongoose.Types.ObjectId} studentId - Student identifier
 * @param {Date} [currentDate=new Date()] - Reference date for boundary calculations
 * @returns {Promise<Object>} Authoritative financial summary
 */
async function resolveStudentFinancialSummary(studentId, currentDate = new Date()) {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    const error = new Error("Student not found");
    error.code = "STUDENT_NOT_FOUND";
    throw error;
  }

  // Retrieve student's institution to inspect institution-configured academic calendar
  let institution = null;
  if (student.institutionId && mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      institution = await Institution.findById(student.institutionId).lean();
    } catch (_) {
      // Continue gracefully if database is unreachable in offline tests
    }
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

  const yearsBreakdown = [];
  let totalAssessed = 0;
  let totalPaid = 0;
  let currentYearFee = 0;
  let currentYearPaid = 0;
  let currentYearDue = 0;
  let previousYearsFee = 0;
  let previousYearsPaid = 0;
  let previousYearsDue = 0;

  for (const item of progression.assessedYears) {
    const y = item.academicYear;
    const sessionLabel = item.academicSession;

    const targetInstId =
      student.institutionId && mongoose.Types.ObjectId.isValid(student.institutionId)
        ? new mongoose.Types.ObjectId(student.institutionId)
        : student.institutionId;

    // 1. Fetch configured FeeStructure for (institutionId, branch, academicYear)
    const feeStructure = await FeeStructure.findOne({
      institutionId: targetInstId,
      branch: student.branch.trim().toUpperCase(),
      academicYear: y,
      isActive: true,
    }).lean();

    let components = [];
    let assessedAmount = 0;
    let feeStructureConfigured = false;

    if (feeStructure) {
      feeStructureConfigured = true;
      const tuition = Number(feeStructure.tuitionFee) || 0;
      const additional = Number(feeStructure.additionalFee) || 0;

      if (Array.isArray(feeStructure.components) && feeStructure.components.length > 0) {
        components = feeStructure.components.map((c) => ({
          code: c.code,
          name: c.name,
          amount: Number(c.amount) || 0,
        }));
      } else {
        components = [
          { code: "TUITION", name: "Tuition & Instruction", amount: tuition },
        ];
        if (additional > 0) {
          components.push({
            code: "ADMIN_LAB",
            name: "Additional Administrative & Lab Fees",
            amount: additional,
          });
        }
      }
      assessedAmount = components.reduce((sum, c) => sum + c.amount, 0);
    }

    // 2. Inspect StudentFeeAccount if exists
    const account = await StudentFeeAccount.findOne({
      institutionId: targetInstId,
      studentId: student._id,
      academicYear: y,
    }).lean();

    let concessions = [];
    let netAssessed = assessedAmount;

    if (account) {
      concessions = account.concessions || [];
      const totalConcessions = concessions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
      netAssessed = Math.max(0, assessedAmount - totalConcessions);
    }

    // 3. Query verified payments from FeesModel (status: 'paid')
    const verifiedPayments = await FeesModel.find({
      studentId: student._id,
      year: y,
      status: "paid",
    }).lean();

    const paidAmount = verifiedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const dueAmount = Math.max(0, netAssessed - paidAmount);

    const yearStatus =
      !feeStructureConfigured && paidAmount === 0 && netAssessed === 0
        ? "NOT_ASSESSED"
        : dueAmount === 0 && netAssessed > 0
        ? "PAID"
        : paidAmount > 0
        ? "PARTIALLY_PAID"
        : netAssessed === 0
        ? "NOT_ASSESSED"
        : "UNPAID";

    const isCurrentYear = y === progression.currentAcademicYear;

    if (isCurrentYear) {
      currentYearFee += netAssessed;
      currentYearPaid += paidAmount;
      currentYearDue += dueAmount;
    } else {
      previousYearsFee += netAssessed;
      previousYearsPaid += paidAmount;
      previousYearsDue += dueAmount;
    }

    totalAssessed += netAssessed;
    totalPaid += paidAmount;

    yearsBreakdown.push({
      academicYear: y,
      academicSession: sessionLabel,
      isCurrentYear,
      feeStructureConfigured,
      components,
      assessedAmount,
      concessions,
      netAssessed,
      paidAmount,
      dueAmount,
      status: yearStatus,
      paymentsCount: verifiedPayments.length,
    });
  }

  const feeStructuresConfiguredCount = yearsBreakdown.filter(
    (y) => y.feeStructureConfigured
  ).length;

  const outstandingBalance = Math.max(0, totalAssessed - totalPaid);
  const overallStatus =
    totalAssessed === 0
      ? "NOT_ASSESSED"
      : outstandingBalance === 0
      ? "PAID"
      : totalPaid > 0
      ? "PARTIALLY_PAID"
      : "UNPAID";

  const studentBatch = student.batch || progression.batch || "N/A";
  let summaryText = "";
  if (totalAssessed === 0) {
    summaryText = `Fee structure has not been configured by your institution for department ${student.branch.toUpperCase()}. No financial obligations have been assessed yet. Please contact your institution registrar or accounts office.`;
  } else if (outstandingBalance === 0) {
    summaryText = "All academic obligations through the current session have been fully settled.";
  } else {
    summaryText = `Total outstanding balance is ₹${outstandingBalance.toLocaleString()} (Current Year: ₹${currentYearDue.toLocaleString()}, Arrears: ₹${previousYearsDue.toLocaleString()}).`;
  }

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
      batch: studentBatch,
    },
    financialSummary: {
      totalAssessed,
      totalPaid,
      outstandingBalance,
      status: overallStatus,
      feeStructuresConfiguredCount,
      currentYearFee,
      currentYearPaid,
      currentYearDue,
      previousYearsFee,
      previousYearsPaid,
      previousYearsDue,
      explainability: {
        summaryText,
        calculationBasis: `Assessed across ${progression.assessedYears.length} academic session(s) (${studentBatch}) based on institution fee structure rules for branch ${student.branch.toUpperCase()}.`,
        assessedYearsCount: progression.assessedYears.length,
        hasArrears: previousYearsDue > 0,
        hasCurrentYearDue: currentYearDue > 0,
      },
    },
    years: yearsBreakdown,
  };
}

/**
 * Synchronizes or creates a StudentFeeAccount record upon successful verified payment.
 *
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.institutionId
 * @param {string|mongoose.Types.ObjectId} params.studentId
 * @param {number} params.academicYear
 * @param {string} params.branch
 * @param {number} params.amountPaid
 * @param {mongoose.Types.ObjectId} [params.feeStructureId]
 * @returns {Promise<Object>} Updated StudentFeeAccount
 */
async function syncStudentFeeAccountOnPayment({
  institutionId,
  studentId,
  academicYear,
  branch,
  amountPaid,
  feeStructureId,
}) {
  let account = await StudentFeeAccount.findOne({
    institutionId,
    studentId,
    academicYear,
  });

  // Calculate assessed amount from FeeStructure if not already present
  let feeStructure = null;
  if (feeStructureId) {
    feeStructure = await FeeStructure.findById(feeStructureId).lean();
  } else {
    feeStructure = await FeeStructure.findOne({
      institutionId,
      branch: branch.trim().toUpperCase(),
      academicYear,
      isActive: true,
    }).lean();
  }

  const tuition = feeStructure ? Number(feeStructure.tuitionFee) || 0 : 0;
  const additional = feeStructure ? Number(feeStructure.additionalFee) || 0 : 0;
  const assessed = tuition + additional;

  if (!account) {
    const totalPaid = Number(amountPaid) || 0;
    const outstandingBalance = Math.max(0, assessed - totalPaid);
    const status = outstandingBalance === 0 ? "paid" : "partially_paid";

    account = new StudentFeeAccount({
      institutionId,
      studentId,
      academicYear,
      branch: branch.trim().toUpperCase(),
      feeStructureId: feeStructure ? feeStructure._id : null,
      components: [
        { code: "TUITION", name: "Tuition & Instruction", amount: tuition },
        ...(additional > 0
          ? [
              {
                code: "ADMIN_LAB",
                name: "Additional Administrative & Lab Fees",
                amount: additional,
              },
            ]
          : []),
      ],
      totalAssessed: assessed,
      netAssessed: assessed,
      totalPaid,
      outstandingBalance,
      status,
    });
    await account.save();
  } else {
    account.totalPaid = (Number(account.totalPaid) || 0) + Number(amountPaid);
    account.outstandingBalance = Math.max(0, account.netAssessed - account.totalPaid);
    account.status = account.outstandingBalance === 0 ? "paid" : "partially_paid";
    await account.save();
  }

  return account;
}

/**
 * Allocates a payment amount across assessed academic years using the
 * deterministic Chronological FIFO (First-In, First-Out / Oldest Outstanding First) policy.
 *
 * @param {Array<Object>} assessedYears - Array of { academicYear, dueAmount, netAssessed, ... }
 * @param {number} paymentAmount - Total amount to allocate
 * @returns {Object} Allocation result: { allocations: Array<{ academicYear, allocatedAmount, previousDue, remainingDue, status }>, unallocatedAmount }
 */
function allocatePaymentChronologicalFIFO(assessedYears, paymentAmount) {
  let remainingPayment = Math.max(0, Number(paymentAmount) || 0);
  const sortedYears = [...assessedYears].sort((a, b) => a.academicYear - b.academicYear);
  const allocations = [];

  for (const yearObj of sortedYears) {
    const due = Math.max(0, Number(yearObj.dueAmount) || 0);
    if (due <= 0) {
      allocations.push({
        academicYear: yearObj.academicYear,
        allocatedAmount: 0,
        previousDue: 0,
        remainingDue: 0,
        status: "PAID",
      });
      continue;
    }

    const alloc = Math.min(due, remainingPayment);
    remainingPayment -= alloc;
    const remainingDue = due - alloc;
    const status = remainingDue === 0 ? "PAID" : alloc > 0 ? "PARTIALLY_PAID" : "UNPAID";

    allocations.push({
      academicYear: yearObj.academicYear,
      allocatedAmount: alloc,
      previousDue: due,
      remainingDue,
      status,
    });
  }

  return {
    allocations,
    unallocatedAmount: remainingPayment,
  };
}

module.exports = {
  resolveStudentFinancialSummary,
  syncStudentFeeAccountOnPayment,
  allocatePaymentChronologicalFIFO,
};
