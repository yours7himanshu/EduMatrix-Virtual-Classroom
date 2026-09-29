const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const FeesModel = require('../models/feesModel');
const Student = require('../models/studentModels');
const FeeStructure = require('../models/feeStructureModel');
const { verifyPayment, payfees, setStripeInstance } = require('../controllers/paymentController');

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

const validStudentId = new mongoose.Types.ObjectId().toString();
const otherStudentId = new mongoose.Types.ObjectId().toString();
const validFeeId = new mongoose.Types.ObjectId().toString();
const otherFeeId = new mongoose.Types.ObjectId().toString();
const validSessionId = 'cs_test_valid_session_12345';

test('Payment Verification Suite', async (t) => {
  let mockDatabase = {};

  const resetMockDb = () => {
    mockDatabase = {
      [validFeeId]: {
        _id: validFeeId,
        studentId: validStudentId,
        amount: 150000,
        rollno: '101',
        email: 'student@example.com',
        year: 1,
        status: 'unpaid',
        stripeSessionId: validSessionId,
        save() {
          return this;
        },
      },
      [otherFeeId]: {
        _id: otherFeeId,
        studentId: otherStudentId,
        amount: 140000,
        rollno: '102',
        email: 'other@example.com',
        year: 2,
        status: 'unpaid',
        stripeSessionId: 'cs_test_other_session_99999',
        save() {
          return this;
        },
      },
    };
  };

  const originalFindById = FeesModel.findById;
  const originalFindByIdAndDelete = FeesModel.findByIdAndDelete;

  FeesModel.findById = (id) => {
    return mockDatabase[id ? id.toString() : ''] || null;
  };

  FeesModel.findByIdAndDelete = (id) => {
    const doc = mockDatabase[id ? id.toString() : ''] || null;
    if (id) delete mockDatabase[id.toString()];
    return doc;
  };

  t.after(() => {
    FeesModel.findById = originalFindById;
    FeesModel.findByIdAndDelete = originalFindByIdAndDelete;
  });

  await t.test('1. Valid paid session successfully updates status to paid', async () => {
    resetMockDb();

    setStripeInstance({
      checkout: {
        sessions: {
          retrieve: (id) => {
            assert.strictEqual(id, validSessionId);
            return {
              id: validSessionId,
              payment_status: 'paid',
              client_reference_id: validFeeId,
              metadata: {
                feeId: validFeeId,
                studentId: validStudentId,
              },
            };
          },
        },
      },
    });

    const req = {
      studentId: validStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: validSessionId,
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.message, 'Payment verified successfully');
    assert.strictEqual(mockDatabase[validFeeId].status, 'paid');
    assert.strictEqual(mockDatabase[validFeeId].stripeSessionId, validSessionId);
  });

  await t.test('2. Unpaid session returns 402 and keeps fee status unpaid', async () => {
    resetMockDb();

    setStripeInstance({
      checkout: {
        sessions: {
          retrieve: () => ({
            id: validSessionId,
            payment_status: 'unpaid',
            client_reference_id: validFeeId,
            metadata: {
              feeId: validFeeId,
              studentId: validStudentId,
            },
          }),
        },
      },
    });

    const req = {
      studentId: validStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: validSessionId,
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 402);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /not been completed/);
    assert.strictEqual(mockDatabase[validFeeId].status, 'unpaid');
  });

  await t.test('3. Invalid or nonexistent session ID returns 400', async () => {
    resetMockDb();

    setStripeInstance({
      checkout: {
        sessions: {
          retrieve: () => {
            const err = new Error('No such checkout session');
            err.code = 'resource_missing';
            throw err;
          },
        },
      },
    });

    const req = {
      studentId: validStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: 'cs_test_nonexistent_xyz',
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Invalid or nonexistent Stripe session/);
    assert.strictEqual(mockDatabase[validFeeId].status, 'unpaid');
  });

  await t.test('4. Session belonging to a different fee record returns 400', async () => {
    resetMockDb();

    setStripeInstance({
      checkout: {
        sessions: {
          retrieve: () => ({
            id: validSessionId,
            payment_status: 'paid',
            client_reference_id: otherFeeId,
            metadata: {
              feeId: otherFeeId,
              studentId: validStudentId,
            },
          }),
        },
      },
    });

    mockDatabase[validFeeId].stripeSessionId = null;

    const req = {
      studentId: validStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: validSessionId,
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /does not match this fee record/);
    assert.strictEqual(mockDatabase[validFeeId].status, 'unpaid');
  });

  await t.test('5. Unauthorized student attempting to verify another student fee returns 403', async () => {
    resetMockDb();

    const req = {
      studentId: otherStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: validSessionId,
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /does not belong to the authenticated student/);
    assert.strictEqual(mockDatabase[validFeeId].status, 'unpaid');
  });

  await t.test('6. Repeated verification / idempotency returns 200 without error', async () => {
    resetMockDb();
    mockDatabase[validFeeId].status = 'paid';
    mockDatabase[validFeeId].stripeSessionId = validSessionId;

    const req = {
      studentId: validStudentId,
      body: {
        paymentId: validFeeId,
        sessionId: validSessionId,
        success: 'true',
      },
    };
    const res = createMockRes();

    await verifyPayment(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.message, 'Payment already verified');
    assert.strictEqual(mockDatabase[validFeeId].status, 'paid');
  });

  await t.test('7. Malformed requests are properly rejected with 400 or 404', async () => {
    resetMockDb();

    const resA = createMockRes();
    await verifyPayment({ body: {} }, resA);
    assert.strictEqual(resA.statusCode, 400);
    assert.match(resA.data.message, /paymentId is required/);

    const resB = createMockRes();
    await verifyPayment({ body: { paymentId: 'invalid-id-123' } }, resB);
    assert.strictEqual(resB.statusCode, 400);
    assert.match(resB.data.message, /Invalid paymentId format/);

    const randomHexId = new mongoose.Types.ObjectId().toString();
    const resC = createMockRes();
    await verifyPayment({ body: { paymentId: randomHexId } }, resC);
    assert.strictEqual(resC.statusCode, 404);
    assert.match(resC.data.message, /Fee record not found/);

    const resD = createMockRes();
    await verifyPayment(
      {
        studentId: validStudentId,
        body: { paymentId: validFeeId, success: 'true' },
      },
      resD
    );
    assert.strictEqual(resD.statusCode, 400);
    assert.match(resD.data.message, /sessionId is required/);

    const resE = createMockRes();
    await verifyPayment(
      {
        studentId: validStudentId,
        body: { paymentId: validFeeId, success: 'false' },
      },
      resE
    );
    assert.strictEqual(resE.statusCode, 200);
    assert.strictEqual(resE.data.success, false);
    assert.match(resE.data.message, /cancelled/);
    assert.strictEqual(mockDatabase[validFeeId], undefined);
  });
});

test('Payment Creation & Server-Authoritative Hardening Suite (SEC-FEE)', async (t) => {
  const originalStudentFindById = Student.findById;
  const originalFeeStructureFindOne = FeeStructure.findOne;
  const originalFeesSave = FeesModel.prototype.save;
  const originalEnvStripe = process.env.STRIPE_SECRET_KEY;

  const testInstId = new mongoose.Types.ObjectId().toString();
  const testStudentId = new mongoose.Types.ObjectId().toString();
  const testOtherStudentId = new mongoose.Types.ObjectId().toString();

  let savedFees = [];
  FeesModel.prototype.save = function () {
    savedFees.push(this);
    return this;
  };

  t.after(() => {
    Student.findById = originalStudentFindById;
    FeeStructure.findOne = originalFeeStructureFindOne;
    FeesModel.prototype.save = originalFeesSave;
    process.env.STRIPE_SECRET_KEY = originalEnvStripe;
    setStripeInstance(null);
  });

  let mockStudent = null;
  let mockFeeStructures = {};
  let stripeCreateCalls = [];

  const setupTestContext = () => {
    savedFees = [];
    stripeCreateCalls = [];

    mockStudent = {
      _id: testStudentId,
      institutionId: testInstId,
      branch: 'CSE',
      rollNo: 101,
      email: 'verified_student@example.com',
    };

    mockFeeStructures = {
      1: {
        _id: new mongoose.Types.ObjectId(),
        institutionId: testInstId,
        branch: 'CSE',
        academicYear: 1,
        tuitionFee: 125000,
        currency: 'inr',
        isActive: true,
      },
      2: {
        _id: new mongoose.Types.ObjectId(),
        institutionId: testInstId,
        branch: 'CSE',
        academicYear: 2,
        tuitionFee: 130000,
        currency: 'inr',
        isActive: true,
      },
      3: {
        _id: new mongoose.Types.ObjectId(),
        institutionId: testInstId,
        branch: 'CSE',
        academicYear: 3,
        tuitionFee: 135000,
        currency: 'inr',
        isActive: true,
      },
      4: {
        _id: new mongoose.Types.ObjectId(),
        institutionId: testInstId,
        branch: 'CSE',
        academicYear: 4,
        tuitionFee: 140000,
        currency: 'inr',
        isActive: true,
      },
    };

    Student.findById = (id) => {
      if (id && id.toString() === testStudentId) {
        return { ...mockStudent };
      }
      return null;
    };

    FeeStructure.findOne = (query) => {
      const { institutionId, branch, academicYear, isActive } = query;
      const struct = mockFeeStructures[academicYear];
      if (
        struct &&
        struct.institutionId === institutionId &&
        struct.branch === branch &&
        (isActive === undefined || struct.isActive === isActive)
      ) {
        return { ...struct };
      }
      return null;
    };

    setStripeInstance({
      checkout: {
        sessions: {
          create: (params) => {
            stripeCreateCalls.push(params);
            return {
              id: `cs_test_session_${Date.now()}`,
              url: 'https://checkout.stripe.com/c/pay/cs_test_sample',
            };
          },
        },
      },
    });
  };

  await t.test('1. Valid request creates payment with server-authoritative tuitionFee and ₹2000 additional fee', async () => {
    setupTestContext();

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.url);
    assert.ok(res.data.sessionId);
    assert.ok(res.data.paymentId);

    // Verify Stripe checkout session params
    assert.strictEqual(stripeCreateCalls.length, 1);
    const sessionCall = stripeCreateCalls[0];
    assert.strictEqual(sessionCall.mode, 'payment');
    assert.strictEqual(sessionCall.customer_email, 'verified_student@example.com');
    assert.strictEqual(sessionCall.metadata.studentId, testStudentId);
    assert.strictEqual(sessionCall.metadata.rollno, '101');
    assert.strictEqual(sessionCall.metadata.year, '1');
    assert.strictEqual(sessionCall.client_reference_id, res.data.paymentId.toString());

    // Line items
    assert.strictEqual(sessionCall.line_items.length, 2);
    const tuitionItem = sessionCall.line_items[0];
    assert.strictEqual(tuitionItem.price_data.product_data.name, 'Tuition fees');
    assert.strictEqual(tuitionItem.price_data.unit_amount, 125000 * 100);
    assert.strictEqual(tuitionItem.price_data.currency, 'inr');
    assert.strictEqual(tuitionItem.quantity, 1);

    const additionalItem = sessionCall.line_items[1];
    assert.strictEqual(additionalItem.price_data.product_data.name, 'Additional fees');
    assert.strictEqual(additionalItem.price_data.unit_amount, 2000 * 100);
    assert.strictEqual(additionalItem.price_data.currency, 'inr');
    assert.strictEqual(additionalItem.quantity, 1);

    // Verify saved FeesModel document
    assert.strictEqual(savedFees.length, 2);
    const savedFee = savedFees[0];
    assert.strictEqual(savedFee.studentId.toString(), testStudentId);
    assert.strictEqual(savedFee.amount, 125000);
    assert.strictEqual(savedFee.rollno, '101');
    assert.strictEqual(savedFee.email, 'verified_student@example.com');
    assert.strictEqual(savedFee.year, 1);
    assert.strictEqual(savedFee.status, 'unpaid');
  });

  await t.test('2. Malicious client-supplied amount (e.g. ₹1 or ₹999999) is strictly ignored', async () => {
    setupTestContext();

    const req = {
      studentId: testStudentId,
      body: {
        year: 1,
        amount: 1,
      },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(stripeCreateCalls.length, 1);
    const tuitionItem = stripeCreateCalls[0].line_items[0];
    assert.strictEqual(tuitionItem.price_data.unit_amount, 125000 * 100, 'Tuition fee must come strictly from FeeStructure, not req.body.amount');
    assert.strictEqual(savedFees[0].amount, 125000, 'Database fee record must store authoritative amount');
  });

  await t.test('3. Malicious client-supplied identity fields (studentId, rollno, email) are strictly ignored', async () => {
    setupTestContext();

    const req = {
      studentId: testStudentId,
      body: {
        year: 1,
        studentId: testOtherStudentId,
        rollno: '999',
        email: 'attacker@evil.com',
      },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 200);
    const sessionCall = stripeCreateCalls[0];
    assert.strictEqual(sessionCall.customer_email, 'verified_student@example.com', 'Email must come from student profile, not req.body');
    assert.strictEqual(sessionCall.metadata.studentId, testStudentId, 'studentId must come from JWT req.studentId, not req.body');
    assert.strictEqual(sessionCall.metadata.rollno, '101', 'rollno must come from student profile, not req.body');
    assert.strictEqual(savedFees[0].studentId.toString(), testStudentId);
    assert.strictEqual(savedFees[0].rollno, '101');
    assert.strictEqual(savedFees[0].email, 'verified_student@example.com');
  });

  await t.test('4. Missing authenticated student identity returns 401 Unauthorized', async () => {
    setupTestContext();

    const req = {
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Unauthorized: Missing authenticated student identity/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('5. Nonexistent student returns 404 Not Found without calling Stripe', async () => {
    setupTestContext();

    const req = {
      studentId: new mongoose.Types.ObjectId().toString(),
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Student record not found/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('6. Student without institutionId returns 400 Bad Request without calling Stripe', async () => {
    setupTestContext();
    mockStudent.institutionId = null;

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /not assigned to an active institution/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('7. Student without branch returns 400 Bad Request without calling Stripe', async () => {
    setupTestContext();
    mockStudent.branch = '';

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /valid branch/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('8. Missing, invalid, non-integer, or out-of-range academic year returns 400', async () => {
    setupTestContext();

    const invalidYears = [
      { val: undefined, expectedMsg: /Academic year is required/ },
      { val: null, expectedMsg: /Academic year is required/ },
      { val: '', expectedMsg: /Academic year is required/ },
      { val: true, expectedMsg: /Academic year is required/ },
      { val: 0, expectedMsg: /Must be an integer between 1 and 4/ },
      { val: 5, expectedMsg: /Must be an integer between 1 and 4/ },
      { val: -1, expectedMsg: /Must be an integer between 1 and 4/ },
      { val: 2.5, expectedMsg: /Must be an integer between 1 and 4/ },
      { val: 'YearOne', expectedMsg: /Must be an integer between 1 and 4/ },
    ];

    for (const { val, expectedMsg } of invalidYears) {
      const res = createMockRes();
      await payfees(
        {
          studentId: testStudentId,
          body: { year: val },
        },
        res
      );

      assert.strictEqual(res.statusCode, 400, `Year ${val} should return 400`);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.message, expectedMsg);
      assert.strictEqual(stripeCreateCalls.length, 0);
    }
  });

  await t.test('9. Missing or inactive FeeStructure returns 404 Not Found without calling Stripe', async () => {
    setupTestContext();
    delete mockFeeStructures[1];

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /No authoritative fee structure found/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('10. Inactive FeeStructure returns 404 Not Found without calling Stripe', async () => {
    setupTestContext();
    mockFeeStructures[1].isActive = false;

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /No authoritative fee structure found/);
    assert.strictEqual(stripeCreateCalls.length, 0);
  });

  await t.test('11. Unconfigured Stripe secret key returns 500 without saving fee record', async () => {
    setupTestContext();
    setStripeInstance(null);
    delete process.env.STRIPE_SECRET_KEY;

    const req = {
      studentId: testStudentId,
      body: { year: 1 },
    };
    const res = createMockRes();

    await payfees(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Stripe is not configured/);
    assert.strictEqual(savedFees.length, 0);
  });

  await t.test('12. Academic years 1, 2, 3, and 4 each resolve correctly with matching fees', async () => {
    setupTestContext();

    for (let yr = 1; yr <= 4; yr++) {
      savedFees = [];
      stripeCreateCalls = [];

      const res = createMockRes();
      await payfees(
        {
          studentId: testStudentId,
          body: { year: yr },
        },
        res
      );

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(stripeCreateCalls.length, 1);
      const expectedFee = mockFeeStructures[yr].tuitionFee;
      assert.strictEqual(stripeCreateCalls[0].line_items[0].price_data.unit_amount, expectedFee * 100);
      assert.strictEqual(savedFees[0].amount, expectedFee);
      assert.strictEqual(savedFees[0].year, yr);
    }
  });
});

