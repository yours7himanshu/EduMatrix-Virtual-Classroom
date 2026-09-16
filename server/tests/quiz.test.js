process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const Quiz = require('../models/quizModels');

const validQuizId = new mongoose.Types.ObjectId().toString();
const q1Id = new mongoose.Types.ObjectId().toString();
const q2Id = new mongoose.Types.ObjectId().toString();

// Extract the handler logic or test against Express router
test('Quiz Submission Suite (BUG-03)', async (t) => {
  let mockQuizzes = {
    [validQuizId]: {
      _id: validQuizId,
      title: 'JavaScript Fundamentals',
      description: 'Test your JS knowledge',
      questions: [
        {
          _id: q1Id,
          questionText: 'What is typeof null?',
          options: ['null', 'undefined', 'object', 'number'],
          correctAnswer: 2, // 'object'
        },
        {
          _id: q2Id,
          questionText: 'Is JavaScript single-threaded?',
          options: ['Yes', 'No'],
          correctAnswer: 0, // 'Yes'
        },
      ],
    },
  };

  const originalFindById = Quiz.findById;
  Quiz.findById = async (id) => {
    return mockQuizzes[id ? id.toString() : ''] || null;
  };

  t.after(() => {
    Quiz.findById = originalFindById;
  });

  const quizRouter = require('../routes/quizessRoutes');

  // Helper to invoke route handler on router stack
  const invokeSubmit = async (req, res) => {
    // Find the POST /quizzes/:id/submit layer
    const submitLayer = quizRouter.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === '/quizzes/:id/submit' &&
        layer.route.methods.post
    );
    assert.ok(submitLayer, 'Route POST /quizzes/:id/submit must exist on quizRouter');
    const handler = submitLayer.route.stack[0].handle;
    await handler(req, res);
  };

  const createMockRes = () => ({
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
  });

  await t.test('1. Perfect score submission calculates 100%', async () => {
    const req = {
      params: { id: validQuizId },
      body: {
        answers: {
          [q1Id]: 2,
          [q2Id]: 0,
        },
      },
    };
    const res = createMockRes();

    await invokeSubmit(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.score, 2);
    assert.strictEqual(res.data.total, 2);
    assert.strictEqual(res.data.percentage, 100);
    assert.strictEqual(res.data.details[0].isCorrect, true);
    assert.strictEqual(res.data.details[1].isCorrect, true);
  });

  await t.test('2. Partial score submission calculates correct score & percentage', async () => {
    const req = {
      params: { id: validQuizId },
      body: {
        answers: {
          [q1Id]: 2, // Correct
          [q2Id]: 1, // Incorrect
        },
      },
    };
    const res = createMockRes();

    await invokeSubmit(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.score, 1);
    assert.strictEqual(res.data.total, 2);
    assert.strictEqual(res.data.percentage, 50);
    assert.strictEqual(res.data.details[0].isCorrect, true);
    assert.strictEqual(res.data.details[1].isCorrect, false);
  });

  await t.test('3. Nonexistent quiz returns 404', async () => {
    const randomId = new mongoose.Types.ObjectId().toString();
    const req = {
      params: { id: randomId },
      body: { answers: {} },
    };
    const res = createMockRes();

    await invokeSubmit(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Quiz not found/);
  });

  await t.test('4. Malformed quiz ID returns 400', async () => {
    const req = {
      params: { id: 'bad-id' },
      body: { answers: {} },
    };
    const res = createMockRes();

    await invokeSubmit(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Invalid quiz ID format/);
  });

  await t.test('5. Missing answers object returns 400', async () => {
    const req = {
      params: { id: validQuizId },
      body: {},
    };
    const res = createMockRes();

    await invokeSubmit(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.message, /Answers are required/);
  });

  await t.test('6. POST /quizzes emits new-quiz event via Socket.IO instance', async () => {
    let emittedEvent = null;
    let emittedData = null;

    const mockIo = {
      emit(event, data) {
        emittedEvent = event;
        emittedData = data;
      },
    };

    const postLayer = quizRouter.stack.find(
      (layer) =>
        layer.route &&
        layer.route.path === '/quizzes' &&
        layer.route.methods.post
    );
    assert.ok(postLayer, 'Route POST /quizzes must exist on quizRouter');

    const originalSave = Quiz.prototype.save;
    Quiz.prototype.save = async function () {
      this._id = new mongoose.Types.ObjectId();
      return this;
    };

    try {
      const handler = postLayer.route.stack[0].handle;
      const req = {
        body: {
          title: 'Science Quiz',
          questions: [],
        },
        app: {
          get(key) {
            if (key === 'io') return mockIo;
            return null;
          },
        },
      };
      const res = createMockRes();

      await handler(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(emittedEvent, 'new-quiz');
      assert.ok(emittedData);
      assert.strictEqual(emittedData.title, 'Science Quiz');
    } finally {
      Quiz.prototype.save = originalSave;
    }
  });
});
