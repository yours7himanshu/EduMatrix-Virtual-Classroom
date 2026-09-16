const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const FeesModel = require('../models/feesModel');
const { verifyPayment, setStripeInstance } = require('../controllers/paymentController');

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
        async save() {
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
        async save() {
          return this;
        },
      },
    };
  };

  const originalFindById = FeesModel.findById;
  const originalFindByIdAndDelete = FeesModel.findByIdAndDelete;

  FeesModel.findById = async (id) => {
    return mockDatabase[id ? id.toString() : ''] || null;
  };

  FeesModel.findByIdAndDelete = async (id) => {
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
          retrieve: async (id) => {
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
          retrieve: async () => ({
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
          retrieve: async () => {
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
          retrieve: async () => ({
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
