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
const {
  getAdminFeeStructures,
  createOrUpdateFeeStructure,
  toggleFeeStructureStatus,
  deleteFeeStructure,
} = require("../controllers/adminFeeStructureController");

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

test("Admin Fee Structure Management Suite (Registrar Role)", async (t) => {
  const instId1 = new mongoose.Types.ObjectId();
  const instId2 = new mongoose.Types.ObjectId();

  // In-memory mock collection for FeeStructure
  let memoryStructures = [];

  const originalFind = FeeStructure.find;
  const originalFindOne = FeeStructure.findOne;
  const originalCreate = FeeStructure.create;
  const originalFindOneAndDelete = FeeStructure.findOneAndDelete;

  FeeStructure.find = (query) => {
    return {
      sort: (sortCriteria) => {
        let results = memoryStructures.filter(
          (s) => s.institutionId.toString() === query.institutionId.toString()
        );
        return Promise.resolve(results);
      },
    };
  };

  FeeStructure.findOne = (query) => {
    let item;
    if (query._id) {
      item = memoryStructures.find(
        (s) =>
          s._id.toString() === query._id.toString() &&
          s.institutionId.toString() === query.institutionId.toString()
      );
    } else {
      item = memoryStructures.find(
        (s) =>
          s.institutionId.toString() === query.institutionId.toString() &&
          s.branch === query.branch &&
          s.academicYear === query.academicYear
      );
    }

    if (!item) return Promise.resolve(null);

    // Return mock document with save() method
    const mockDoc = {
      ...item,
      save: async function () {
        const idx = memoryStructures.findIndex(
          (s) => s._id.toString() === this._id.toString()
        );
        if (idx !== -1) {
          memoryStructures[idx] = { ...this };
        }
        return this;
      },
    };
    return Promise.resolve(mockDoc);
  };

  FeeStructure.create = async (doc) => {
    const created = {
      _id: new mongoose.Types.ObjectId(),
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStructures.push(created);
    return created;
  };

  FeeStructure.findOneAndDelete = async (query) => {
    const idx = memoryStructures.findIndex(
      (s) =>
        s._id.toString() === query._id.toString() &&
        s.institutionId.toString() === query.institutionId.toString()
    );
    if (idx === -1) return null;
    const removed = memoryStructures[idx];
    memoryStructures.splice(idx, 1);
    return removed;
  };

  t.after(() => {
    FeeStructure.find = originalFind;
    FeeStructure.findOne = originalFindOne;
    FeeStructure.create = originalCreate;
    FeeStructure.findOneAndDelete = originalFindOneAndDelete;
  });

  await t.test("1. Rejects non-Registrar roles (Director, Teacher) with 403 Forbidden", async () => {
    const reqDirector = {
      user: { role: "Director", institutionId: instId1 },
    };
    const resDirector = createMockRes();
    await getAdminFeeStructures(reqDirector, resDirector);
    assert.strictEqual(resDirector.statusCode, 403);
    assert.strictEqual(resDirector.data.success, false);
    assert.match(resDirector.data.message, /restricted exclusively to the Registrar role/i);

    const reqTeacher = {
      user: { role: "Teacher", institutionId: instId1 },
      body: { branch: "CSE", academicYear: 1, tuitionFee: 100000 },
    };
    const resTeacher = createMockRes();
    await createOrUpdateFeeStructure(reqTeacher, resTeacher);
    assert.strictEqual(resTeacher.statusCode, 403);
    assert.strictEqual(resTeacher.data.success, false);
  });

  await t.test("2. Rejects unauthenticated request without req.user with 403", async () => {
    const reqUnauth = { user: null };
    const resUnauth = createMockRes();
    await getAdminFeeStructures(reqUnauth, resUnauth);
    assert.strictEqual(resUnauth.statusCode, 403);
  });

  await t.test("3. Validates required input fields on createOrUpdateFeeStructure", async () => {
    const registrarUser = { role: "Registrar", institutionId: instId1 };

    // Missing branch
    const req1 = { user: registrarUser, body: { academicYear: 1, tuitionFee: 100000 } };
    const res1 = createMockRes();
    await createOrUpdateFeeStructure(req1, res1);
    assert.strictEqual(res1.statusCode, 400);
    assert.match(res1.data.message, /branch is required/i);

    // Invalid academicYear (0 or 5)
    const req2 = { user: registrarUser, body: { branch: "CSE", academicYear: 5, tuitionFee: 100000 } };
    const res2 = createMockRes();
    await createOrUpdateFeeStructure(req2, res2);
    assert.strictEqual(res2.statusCode, 400);
    assert.match(res2.data.message, /academic year must be an integer between 1 and 4/i);

    // Negative tuitionFee
    const req3 = { user: registrarUser, body: { branch: "CSE", academicYear: 1, tuitionFee: -500 } };
    const res3 = createMockRes();
    await createOrUpdateFeeStructure(req3, res3);
    assert.strictEqual(res3.statusCode, 400);
    assert.match(res3.data.message, /tuition fee must be a valid non-negative number/i);
  });

  await t.test("4. Registrar publishes a new FeeStructure (201 Created)", async () => {
    memoryStructures = [];
    const req = {
      user: { role: "Registrar", institutionId: instId1 },
      body: {
        branch: "cse",
        academicYear: 1,
        tuitionFee: 150000,
        additionalFee: 2500,
        currency: "INR",
        isActive: true,
      },
    };
    const res = createMockRes();
    await createOrUpdateFeeStructure(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.feeStructure.branch, "CSE");
    assert.strictEqual(res.data.feeStructure.academicYear, 1);
    assert.strictEqual(res.data.feeStructure.tuitionFee, 150000);
    assert.strictEqual(res.data.feeStructure.additionalFee, 2500);
    assert.strictEqual(res.data.feeStructure.isActive, true);
    assert.strictEqual(res.data.feeStructure.components.length, 2);
    assert.strictEqual(res.data.feeStructure.components[0].code, "TUITION");
    assert.strictEqual(res.data.feeStructure.components[1].code, "ADMIN_LAB");
  });

  await t.test("5. Re-publishing updates existing FeeStructure (upsert, 200 OK)", async () => {
    const req = {
      user: { role: "Registrar", institutionId: instId1 },
      body: {
        branch: "CSE",
        academicYear: 1,
        tuitionFee: 160000,
        additionalFee: 3000,
      },
    };
    const res = createMockRes();
    await createOrUpdateFeeStructure(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.feeStructure.tuitionFee, 160000);
    assert.strictEqual(res.data.feeStructure.additionalFee, 3000);
    // Should still have exactly 1 record in memory for (instId1, CSE, Year 1)
    assert.strictEqual(
      memoryStructures.filter(
        (s) => s.institutionId.toString() === instId1.toString() && s.branch === "CSE" && s.academicYear === 1
      ).length,
      1
    );
  });

  await t.test("6. Lists institutional fee structures with multi-tenant isolation", async () => {
    // Publish a fee structure for Institution 2
    await FeeStructure.create({
      institutionId: instId2,
      branch: "ECE",
      academicYear: 1,
      tuitionFee: 120000,
      additionalFee: 1000,
      isActive: true,
    });

    // Registrar 1 lists: should only see Institution 1 records
    const req1 = { user: { role: "Registrar", institutionId: instId1 } };
    const res1 = createMockRes();
    await getAdminFeeStructures(req1, res1);
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.data.count, 1);
    assert.strictEqual(res1.data.feeStructures[0].branch, "CSE");

    // Registrar 2 lists: should only see Institution 2 records
    const req2 = { user: { role: "Registrar", institutionId: instId2 } };
    const res2 = createMockRes();
    await getAdminFeeStructures(req2, res2);
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.data.count, 1);
    assert.strictEqual(res2.data.feeStructures[0].branch, "ECE");
  });

  await t.test("7. Toggles active/inactive status", async () => {
    const item = memoryStructures.find(
      (s) => s.institutionId.toString() === instId1.toString()
    );

    const reqToggle = {
      user: { role: "Registrar", institutionId: instId1 },
      params: { id: item._id.toString() },
      body: { isActive: false },
    };
    const resToggle = createMockRes();
    await toggleFeeStructureStatus(reqToggle, resToggle);
    assert.strictEqual(resToggle.statusCode, 200);
    assert.strictEqual(resToggle.data.feeStructure.isActive, false);

    // Toggle back with no body (inverts)
    const reqInvert = {
      user: { role: "Registrar", institutionId: instId1 },
      params: { id: item._id.toString() },
      body: {},
    };
    const resInvert = createMockRes();
    await toggleFeeStructureStatus(reqInvert, resInvert);
    assert.strictEqual(resInvert.statusCode, 200);
    assert.strictEqual(resInvert.data.feeStructure.isActive, true);
  });

  await t.test("8. Cross-institution access rejection (Tenant Security)", async () => {
    const itemInst1 = memoryStructures.find(
      (s) => s.institutionId.toString() === instId1.toString()
    );

    // Registrar from Institution 2 attempts to toggle or delete Institution 1's fee structure
    const reqCross = {
      user: { role: "Registrar", institutionId: instId2 },
      params: { id: itemInst1._id.toString() },
    };
    const resCrossToggle = createMockRes();
    await toggleFeeStructureStatus(reqCross, resCrossToggle);
    assert.strictEqual(resCrossToggle.statusCode, 404);

    const resCrossDelete = createMockRes();
    await deleteFeeStructure(reqCross, resCrossDelete);
    assert.strictEqual(resCrossDelete.statusCode, 404);
  });

  await t.test("9. Registrar deletes institutional fee structure", async () => {
    const item = memoryStructures.find(
      (s) => s.institutionId.toString() === instId1.toString()
    );
    const req = {
      user: { role: "Registrar", institutionId: instId1 },
      params: { id: item._id.toString() },
    };
    const res = createMockRes();
    await deleteFeeStructure(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);

    // Confirm deletion
    const remaining = memoryStructures.filter(
      (s) => s.institutionId.toString() === instId1.toString()
    );
    assert.strictEqual(remaining.length, 0);
  });
});
