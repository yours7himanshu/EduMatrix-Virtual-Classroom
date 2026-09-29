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
const FeeStructure = require("../models/feeStructureModel");
const Admin = require("../models/adminModels");
const Student = require("../models/studentModels");
const StudentFeeAccount = require("../models/studentFeeAccountModel");
const FeesModel = require("../models/feesModel");
const {
  getAdminFeeStructures,
  getAdminFeeStructureById,
  createOrUpdateFeeStructure,
  updateFeeStructureById,
  toggleFeeStructureStatus,
  deleteFeeStructure,
} = require("../controllers/adminFeeStructureController");
const { getFeeStructure } = require("../services/feeStructureService");
const { resolveStudentFinancialSummary } = require("../services/studentFeeLedgerService");

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

test("Multi-Tenant FeeStructure Isolation & Attack Defense Suite", async (t) => {
  // 1. Define Two Completely Separate Real Tenant Institutions
  const instAId = new mongoose.Types.ObjectId();
  const instBId = new mongoose.Types.ObjectId();

  // 2. Define Two Separate Registrars
  const regAId = new mongoose.Types.ObjectId();
  const regBId = new mongoose.Types.ObjectId();

  // In-memory mock database for isolated testing (ZERO live DB writes)
  const mockAdmins = [
    {
      _id: regAId,
      email: "registrarA@collegeA.edu",
      role: "Registrar",
      institutionId: instAId,
      isActive: true,
    },
    {
      _id: regBId,
      email: "registrarB@collegeB.edu",
      role: "Registrar",
      institutionId: instBId,
      isActive: true,
    },
  ];

  let mockFeeStructures = [
    {
      _id: new mongoose.Types.ObjectId(),
      institutionId: instAId,
      branch: "CSE",
      academicYear: 1,
      tuitionFee: 50000,
      additionalFee: 2000,
      components: [
        { code: "TUITION", name: "Tuition Fee", amount: 50000 },
        { code: "ADMIN_LAB", name: "Lab Infrastructure", amount: 2000 },
      ],
      currency: "inr",
      isActive: true,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      institutionId: instBId,
      branch: "CSE",
      academicYear: 1,
      tuitionFee: 88000,
      additionalFee: 3000,
      components: [
        { code: "TUITION", name: "Tuition Fee", amount: 88000 },
        { code: "ADMIN_LAB", name: "Lab Infrastructure", amount: 3000 },
      ],
      currency: "inr",
      isActive: true,
    },
  ];

  const structA = mockFeeStructures[0];
  const structB = mockFeeStructures[1];

  // Save original methods
  const origAdminFindById = Admin.findById;
  const origFeeFind = FeeStructure.find;
  const origFeeFindOne = FeeStructure.findOne;
  const origFeeFindOneAndUpdate = FeeStructure.findOneAndUpdate;
  const origFeeFindOneAndDelete = FeeStructure.findOneAndDelete;
  const origFeeCreate = FeeStructure.create;
  const origStudentFindById = Student.findById;
  const origAccountFindOne = StudentFeeAccount.findOne;
  const origFeesFind = FeesModel.find;

  // Mock StudentFeeAccount.findOne
  StudentFeeAccount.findOne = () => ({
    lean: () => Promise.resolve(null),
    then: (resolve) => resolve(null),
  });

  // Mock FeesModel.find
  FeesModel.find = () => ({
    lean: () => Promise.resolve([]),
    then: (resolve) => resolve([]),
  });

  // Mock Admin.findById
  Admin.findById = (id) => {
    const admin = mockAdmins.find((a) => a._id.toString() === id.toString());
    return Promise.resolve(admin || null);
  };

  // Mock FeeStructure.find
  FeeStructure.find = (query) => {
    return {
      sort: () => {
        let results = mockFeeStructures.filter((s) => {
          if (query.institutionId && s.institutionId.toString() !== query.institutionId.toString()) {
            return false;
          }
          if (query.branch && s.branch !== query.branch) return false;
          if (query.academicYear && s.academicYear !== query.academicYear) return false;
          if (typeof query.isActive !== "undefined" && s.isActive !== query.isActive) return false;
          return true;
        });
        return Promise.resolve(results);
      },
    };
  };

  // Mock FeeStructure.findOne
  FeeStructure.findOne = (query) => {
    const queryInstitutionId = query.institutionId ? query.institutionId.toString() : null;
    let found = mockFeeStructures.find((s) => {
      if (query._id && s._id.toString() !== query._id.toString()) return false;
      if (queryInstitutionId && s.institutionId.toString() !== queryInstitutionId) return false;
      if (query.branch && s.branch !== query.branch) return false;
      if (query.academicYear && s.academicYear !== query.academicYear) return false;
      if (typeof query.isActive !== "undefined" && s.isActive !== query.isActive) return false;
      return true;
    });

    if (!found) {
      return {
        lean: () => Promise.resolve(null),
        then: (resolve) => resolve(null),
      };
    }

    const doc = {
      ...found,
      save: function () {
        const idx = mockFeeStructures.findIndex((s) => s._id.toString() === this._id.toString());
        if (idx !== -1) mockFeeStructures[idx] = { ...this };
        return this;
      },
    };

    return {
      lean: () => Promise.resolve(doc),
      then: (resolve) => resolve(doc),
    };
  };

  // Mock FeeStructure.findOneAndUpdate
  FeeStructure.findOneAndUpdate = (filter, update) => {
    const filterInstId = filter.institutionId ? filter.institutionId.toString() : null;
    const idx = mockFeeStructures.findIndex((s) => {
      if (filter._id && s._id.toString() !== filter._id.toString()) return false;
      if (filterInstId && s.institutionId.toString() !== filterInstId) return false;
      return true;
    });

    if (idx === -1) return Promise.resolve(null);

    const updated = {
      ...mockFeeStructures[idx],
      ...(update.$set || update),
    };
    mockFeeStructures[idx] = updated;
    return Promise.resolve(updated);
  };

  // Mock FeeStructure.findOneAndDelete
  FeeStructure.findOneAndDelete = (filter) => {
    const filterInstId = filter.institutionId ? filter.institutionId.toString() : null;
    const idx = mockFeeStructures.findIndex((s) => {
      if (filter._id && s._id.toString() !== filter._id.toString()) return false;
      if (filterInstId && s.institutionId.toString() !== filterInstId) return false;
      return true;
    });

    if (idx === -1) return Promise.resolve(null);

    const deleted = mockFeeStructures[idx];
    mockFeeStructures.splice(idx, 1);
    return Promise.resolve(deleted);
  };

  // Mock FeeStructure.create
  FeeStructure.create = (doc) => {
    const created = {
      _id: new mongoose.Types.ObjectId(),
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFeeStructures.push(created);
    return Promise.resolve(created);
  };

  t.after(() => {
    Admin.findById = origAdminFindById;
    FeeStructure.find = origFeeFind;
    FeeStructure.findOne = origFeeFindOne;
    FeeStructure.findOneAndUpdate = origFeeFindOneAndUpdate;
    FeeStructure.findOneAndDelete = origFeeFindOneAndDelete;
    FeeStructure.create = origFeeCreate;
    Student.findById = origStudentFindById;
    StudentFeeAccount.findOne = origAccountFindOne;
    FeesModel.find = origFeesFind;
  });

  // =========================================================================
  // TEST 1: Dual Tenant Cohabitation
  // =========================================================================
  await t.test("1. Two institutions can have identical branch (CSE) and year (1) with distinct fees", () => {
    assert.strictEqual(structA.branch, "CSE");
    assert.strictEqual(structB.branch, "CSE");
    assert.strictEqual(structA.academicYear, 1);
    assert.strictEqual(structB.academicYear, 1);
    assert.notStrictEqual(structA.institutionId.toString(), structB.institutionId.toString());
    assert.strictEqual(structA.tuitionFee + structA.additionalFee, 52000);
    assert.strictEqual(structB.tuitionFee + structB.additionalFee, 91000);
  });

  // =========================================================================
  // TEST 2: Registrar List Isolation
  // =========================================================================
  await t.test("2. Registrar A only sees Institution A fees (₹52,000) and cannot see Institution B (₹91,000)", async () => {
    const reqA = { user: { id: regAId, role: "Registrar", institutionId: instAId } };
    const resA = createMockRes();
    await getAdminFeeStructures(reqA, resA);

    assert.strictEqual(resA.statusCode, 200);
    assert.strictEqual(resA.data.feeStructures.length, 1);
    const item = resA.data.feeStructures[0];
    assert.strictEqual(item.institutionId.toString(), instAId.toString());
    assert.strictEqual(item.tuitionFee + item.additionalFee, 52000);
    assert.strictEqual(resA.data.feeStructures.some((s) => s.institutionId.toString() === instBId.toString()), false);
  });

  await t.test("3. Registrar B only sees Institution B fees (₹91,000) and cannot see Institution A (₹52,000)", async () => {
    const reqB = { user: { id: regBId, role: "Registrar", institutionId: instBId } };
    const resB = createMockRes();
    await getAdminFeeStructures(reqB, resB);

    assert.strictEqual(resB.statusCode, 200);
    assert.strictEqual(resB.data.feeStructures.length, 1);
    const item = resB.data.feeStructures[0];
    assert.strictEqual(item.institutionId.toString(), instBId.toString());
    assert.strictEqual(item.tuitionFee + item.additionalFee, 91000);
    assert.strictEqual(resB.data.feeStructures.some((s) => s.institutionId.toString() === instAId.toString()), false);
  });

  // =========================================================================
  // TEST 3: Cross-Tenant Attacks by ID
  // =========================================================================
  await t.test("4. Cross-Tenant GET attack: Registrar A requesting Institution B FeeStructure ID receives 404 Not Found", async () => {
    const reqAttack = {
      user: { id: regAId, role: "Registrar", institutionId: instAId },
      params: { id: structB._id.toString() },
    };
    const resAttack = createMockRes();
    await getAdminFeeStructureById(reqAttack, resAttack);

    assert.strictEqual(resAttack.statusCode, 404);
    assert.strictEqual(resAttack.data.success, false);
    assert.match(resAttack.data.message, /not found or does not belong to your institution/i);
  });

  await t.test("5. Cross-Tenant PUT attack: Registrar A attempting to update Institution B FeeStructure receives 404 Not Found", async () => {
    const reqAttack = {
      user: { id: regAId, role: "Registrar", institutionId: instAId },
      params: { id: structB._id.toString() },
      body: { tuitionFee: 1000 },
    };
    const resAttack = createMockRes();
    await updateFeeStructureById(reqAttack, resAttack);

    assert.strictEqual(resAttack.statusCode, 404);
    assert.strictEqual(resAttack.data.success, false);
    assert.match(resAttack.data.message, /not found or does not belong to your institution/i);

    // Verify Institution B's record was untouched
    const freshB = mockFeeStructures.find((s) => s._id.toString() === structB._id.toString());
    assert.strictEqual(freshB.tuitionFee, 88000);
  });

  await t.test("6. Cross-Tenant TOGGLE attack: Registrar A attempting to deactivate Institution B FeeStructure receives 404", async () => {
    const reqAttack = {
      user: { id: regAId, role: "Registrar", institutionId: instAId },
      params: { id: structB._id.toString() },
      body: { isActive: false },
    };
    const resAttack = createMockRes();
    await toggleFeeStructureStatus(reqAttack, resAttack);

    assert.strictEqual(resAttack.statusCode, 404);
    assert.strictEqual(resAttack.data.success, false);
    const freshB = mockFeeStructures.find((s) => s._id.toString() === structB._id.toString());
    assert.strictEqual(freshB.isActive, true);
  });

  await t.test("7. Cross-Tenant DELETE attack: Registrar A attempting to delete Institution B FeeStructure receives 404", async () => {
    const reqAttack = {
      user: { id: regAId, role: "Registrar", institutionId: instAId },
      params: { id: structB._id.toString() },
    };
    const resAttack = createMockRes();
    await deleteFeeStructure(reqAttack, resAttack);

    assert.strictEqual(resAttack.statusCode, 404);
    assert.strictEqual(resAttack.data.success, false);
    const freshB = mockFeeStructures.find((s) => s._id.toString() === structB._id.toString());
    assert.ok(freshB, "Institution B fee structure must remain completely preserved");
  });

  // =========================================================================
  // TEST 4: Cross-Tenant Injection in POST Body
  // =========================================================================
  await t.test("8. Cross-Tenant PUBLISH attack: Registrar A sending institutionId of B in POST body is strictly ignored", async () => {
    const reqAttack = {
      user: { id: regAId, role: "Registrar", institutionId: instAId },
      body: {
        institutionId: instBId.toString(), // Attacker tries to inject Institution B
        branch: "IT",
        academicYear: 1,
        tuitionFee: 60000,
        additionalFee: 2000,
      },
    };
    const resAttack = createMockRes();
    await createOrUpdateFeeStructure(reqAttack, resAttack);

    assert.strictEqual(resAttack.statusCode, 201);
    assert.strictEqual(resAttack.data.success, true);
    // Verified: Saved under Institution A, NEVER Institution B!
    assert.strictEqual(resAttack.data.feeStructure.institutionId.toString(), instAId.toString());
    assert.notStrictEqual(resAttack.data.feeStructure.institutionId.toString(), instBId.toString());
  });

  // =========================================================================
  // TEST 5: Student Isolation & Service Layer Lookup
  // =========================================================================
  await t.test("9. Service Layer: getFeeStructure strictly returns Institution A structure for Institution A", async () => {
    const resultA = await getFeeStructure({
      institutionId: instAId,
      branch: "CSE",
      academicYear: 1,
    });
    assert.strictEqual(resultA.institutionId.toString(), instAId.toString());
    assert.strictEqual(resultA.tuitionFee + resultA.additionalFee, 52000);
  });

  await t.test("10. Service Layer: getFeeStructure strictly returns Institution B structure for Institution B", async () => {
    const resultB = await getFeeStructure({
      institutionId: instBId,
      branch: "CSE",
      academicYear: 1,
    });
    assert.strictEqual(resultB.institutionId.toString(), instBId.toString());
    assert.strictEqual(resultB.tuitionFee + resultB.additionalFee, 91000);
  });

  await t.test("11. Student Financial Ledger: Student A (Inst A) assessed ₹52,000; Student B (Inst B) assessed ₹91,000", async () => {
    const studentAId = new mongoose.Types.ObjectId();
    const studentBId = new mongoose.Types.ObjectId();

    const studentA = {
      _id: studentAId,
      name: "Student Alpha",
      rollNo: 101,
      branch: "CSE",
      batch: "2026-2030",
      institutionId: instAId,
    };
    const studentB = {
      _id: studentBId,
      name: "Student Beta",
      rollNo: 202,
      branch: "CSE",
      batch: "2026-2030",
      institutionId: instBId,
    };

    Student.findById = (id) => {
      const target =
        id.toString() === studentAId.toString()
          ? studentA
          : id.toString() === studentBId.toString()
          ? studentB
          : null;
      return {
        lean: () => Promise.resolve(target),
      };
    };

    // Reference date within session 2026-2027 (Year 1)
    const testDate = new Date("2026-09-15");

    const summaryA = await resolveStudentFinancialSummary(studentAId, testDate);
    assert.strictEqual(summaryA.status, "RESOLVED");
    assert.strictEqual(summaryA.financialSummary.totalAssessed, 52000);
    assert.strictEqual(summaryA.financialSummary.outstandingBalance, 52000);

    const summaryB = await resolveStudentFinancialSummary(studentBId, testDate);
    assert.strictEqual(summaryB.status, "RESOLVED");
    assert.strictEqual(summaryB.financialSummary.totalAssessed, 91000);
    assert.strictEqual(summaryB.financialSummary.outstandingBalance, 91000);
  });
});
