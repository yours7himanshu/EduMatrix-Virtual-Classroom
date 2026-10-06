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
  getFeeStructure,
  normalizeFeeLookupParams,
} = require("../services/feeStructureService");

test("FeeStructure Model & Schema Integrity Suite", async (t) => {
  const dummyInstitutionId = new mongoose.Types.ObjectId();

  await t.test("1. Schema enforces required fields and correct types", () => {
    const paths = FeeStructure.schema.paths;

    assert.ok(paths.institutionId, "institutionId path should exist");
    assert.strictEqual(paths.institutionId.options.required[0], true);
    assert.strictEqual(paths.institutionId.options.index, true);

    assert.ok(paths.branch, "branch path should exist");
    assert.strictEqual(paths.branch.options.required[0], true);
    assert.strictEqual(paths.branch.options.uppercase, true);
    assert.strictEqual(paths.branch.options.trim, true);

    assert.ok(paths.academicYear, "academicYear path should exist");
    assert.strictEqual(paths.academicYear.options.required[0], true);

    assert.ok(paths.tuitionFee, "tuitionFee path should exist");
    assert.strictEqual(paths.tuitionFee.options.required[0], true);

    assert.ok(paths.currency, "currency path should exist");
    assert.strictEqual(paths.currency.options.default, "inr");

    assert.ok(paths.isActive, "isActive path should exist");
    assert.strictEqual(paths.isActive.options.default, true);
    assert.strictEqual(paths.isActive.options.index, true);
  });

  await t.test("2. Schema enforces compound unique index on (institutionId, branch, academicYear)", () => {
    const indexes = FeeStructure.schema.indexes();
    const compoundUniqueIndex = indexes.find(([fields, options]) => {
      return (
        fields.institutionId === 1 &&
        fields.branch === 1 &&
        fields.academicYear === 1 &&
        options.unique === true
      );
    });

    assert.ok(
      compoundUniqueIndex,
      "Compound unique index on { institutionId: 1, branch: 1, academicYear: 1 } must exist"
    );
  });

  await t.test("3. Valid FeeStructure document passes validation", () => {
    const doc = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 1,
      tuitionFee: 100000,
      currency: "inr",
      isActive: true,
    });

    const validationError = doc.validateSync();
    assert.strictEqual(validationError, undefined);
  });

  await t.test("4. Missing required fields fail validation", () => {
    const doc = new FeeStructure({});
    const err = doc.validateSync();
    assert.ok(err, "Validation error expected for missing fields");
    assert.ok(err.errors.institutionId, "institutionId should be required");
    assert.ok(err.errors.branch, "branch should be required");
    assert.ok(err.errors.academicYear, "academicYear should be required");
    assert.ok(err.errors.tuitionFee, "tuitionFee should be required");
  });

  await t.test("5. Academic year outside 1-4 is rejected", () => {
    // Year 0
    const doc0 = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 0,
      tuitionFee: 50000,
    });
    assert.ok(doc0.validateSync()?.errors.academicYear);

    // Year 5
    const doc5 = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 5,
      tuitionFee: 50000,
    });
    assert.ok(doc5.validateSync()?.errors.academicYear);

    // Non-integer year (2.5)
    const docFloat = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 2.5,
      tuitionFee: 50000,
    });
    assert.ok(docFloat.validateSync()?.errors.academicYear);
  });

  await t.test("6. Negative or non-numeric tuitionFee is rejected", () => {
    // Negative fee
    const docNeg = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 2,
      tuitionFee: -500,
    });
    assert.ok(docNeg.validateSync()?.errors.tuitionFee);

    // Zero fee is allowed (scholarship / free tuition)
    const docZero = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 2,
      tuitionFee: 0,
    });
    assert.strictEqual(docZero.validateSync(), undefined);

    // NaN fee
    const docNaN = new FeeStructure({
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 2,
      tuitionFee: NaN,
    });
    assert.ok(docNaN.validateSync()?.errors.tuitionFee);
  });
});

test("FeeStructure Service Layer Suite", async (t) => {
  const dummyInstitutionId = new mongoose.Types.ObjectId().toString();

  await t.test("1. normalizeFeeLookupParams normalizes branch and validates year", () => {
    const res = normalizeFeeLookupParams({
      institutionId: dummyInstitutionId,
      branch: "  cse  ",
      academicYear: "2",
    });

    assert.strictEqual(res.branch, "CSE");
    assert.strictEqual(res.academicYear, 2);
    assert.strictEqual(res.institutionId, dummyInstitutionId);
  });

  await t.test("2. normalizeFeeLookupParams throws on missing or invalid inputs", () => {
    assert.throws(
      () => normalizeFeeLookupParams({ branch: "CSE", academicYear: 1 }),
      /institutionId is required/
    );

    assert.throws(
      () =>
        normalizeFeeLookupParams({
          institutionId: dummyInstitutionId,
          branch: "   ",
          academicYear: 1,
        }),
      /branch is required/
    );

    assert.throws(
      () =>
        normalizeFeeLookupParams({
          institutionId: dummyInstitutionId,
          branch: "CSE",
          academicYear: 5,
        }),
      /academicYear must be an integer between 1 and 4/
    );

    assert.throws(
      () =>
        normalizeFeeLookupParams({
          institutionId: dummyInstitutionId,
          branch: "CSE",
          academicYear: 1.5,
        }),
      /academicYear must be an integer between 1 and 4/
    );
  });

  await t.test("3. getFeeStructure queries FeeStructure and returns active document", async () => {
    const originalFindOne = FeeStructure.findOne;
    t.after(() => {
      FeeStructure.findOne = originalFindOne;
    });

    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      institutionId: dummyInstitutionId,
      branch: "CSE",
      academicYear: 1,
      tuitionFee: 120000,
      currency: "inr",
      isActive: true,
    };

    FeeStructure.findOne = (query) => {
      assert.strictEqual(query.institutionId, dummyInstitutionId);
      assert.strictEqual(query.branch, "CSE");
      assert.strictEqual(query.academicYear, 1);
      assert.strictEqual(query.isActive, true);
      return mockDoc;
    };

    const result = await getFeeStructure({
      institutionId: dummyInstitutionId,
      branch: "cse",
      academicYear: 1,
    });

    assert.deepStrictEqual(result, mockDoc);
  });

  await t.test("4. getFeeStructure fails clearly when fee structure not found", async () => {
    const originalFindOne = FeeStructure.findOne;
    t.after(() => {
      FeeStructure.findOne = originalFindOne;
    });

    FeeStructure.findOne = () => null;

    await assert.rejects(
      async () => {
        await getFeeStructure({
          institutionId: dummyInstitutionId,
          branch: "ME",
          academicYear: 3,
        });
      },
      (err) => {
        assert.strictEqual(err.code, "FEE_STRUCTURE_NOT_FOUND");
        assert.match(err.message, /No active fee structure found/);
        return true;
      }
    );
  });

  await t.test("5. Inactive structures are not returned by the service", async () => {
    const originalFindOne = FeeStructure.findOne;
    t.after(() => {
      FeeStructure.findOne = originalFindOne;
    });

    // Mongoose query filter isActive: true returns null for inactive structures
    FeeStructure.findOne = (query) => {
      if (query.isActive === true) {
        return null;
      }
      return { isActive: false };
    };

    await assert.rejects(
      async () => {
        await getFeeStructure({
          institutionId: dummyInstitutionId,
          branch: "ECE",
          academicYear: 2,
        });
      },
      (err) => {
        assert.strictEqual(err.code, "FEE_STRUCTURE_NOT_FOUND");
        return true;
      }
    );
  });
});

