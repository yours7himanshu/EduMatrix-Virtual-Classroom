const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Assignment = require('../models/assignmentModels');
const { deleteAssignment } = require('../controllers/assignmentController');

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

const validAssignmentId = new mongoose.Types.ObjectId().toString();

test('Assignment Deletion Suite (BUG-02)', async (t) => {
  let mockDatabase = {};

  const resetMockDb = () => {
    mockDatabase = {
      [validAssignmentId]: {
        _id: validAssignmentId,
        title: 'Math Assignment 1',
        description: 'Calculus homework',
        questions: 'Solve problems 1-10',
        deadline: new Date(),
        pdfUrl: 'https://example.com/math.pdf',
      },
    };
  };

  const originalFindByIdAndDelete = Assignment.findByIdAndDelete;

  Assignment.findByIdAndDelete = (id) => {
    const doc = mockDatabase[id ? id.toString() : ''] || null;
    if (id) delete mockDatabase[id.toString()];
    return doc;
  };

  t.after(() => {
    Assignment.findByIdAndDelete = originalFindByIdAndDelete;
  });

  await t.test('1. Successful deletion returns 200 with success JSON response', async () => {
    resetMockDb();

    const req = {
      params: { id: validAssignmentId },
    };
    const res = createMockRes();

    await deleteAssignment(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.message, 'Assignment Successfully deleted');
    assert.strictEqual(mockDatabase[validAssignmentId], undefined);
  });

  await t.test('2. Deletion of nonexistent assignment returns 404', async () => {
    resetMockDb();

    const randomId = new mongoose.Types.ObjectId().toString();
    const req = {
      params: { id: randomId },
    };
    const res = createMockRes();

    await deleteAssignment(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'No assignment found to delete');
  });

  await t.test('3. Malformed assignment ID returns 400 without hitting DB', async () => {
    resetMockDb();

    const req = {
      params: { id: 'invalid-id-not-24-chars' },
    };
    const res = createMockRes();

    await deleteAssignment(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Invalid assignment ID format/);
    assert.notStrictEqual(mockDatabase[validAssignmentId], undefined);
  });

  await t.test('4. Server error during deletion returns 500 without hanging', async () => {
    resetMockDb();

    Assignment.findByIdAndDelete = () => {
      throw new Error('Database connection lost');
    };

    const req = {
      params: { id: validAssignmentId },
    };
    const res = createMockRes();

    await deleteAssignment(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Some error occured/);

    // Restore mock
    Assignment.findByIdAndDelete = (id) => {
      const doc = mockDatabase[id ? id.toString() : ''] || null;
      if (id) delete mockDatabase[id.toString()];
      return doc;
    };
  });
});
