const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  predictPlacement,
  summarizeDocument,
  generateQuestionsFromDocument,
} = require('../services/documentAiService');
const AiPredictorController = require('../controllers/aiPredictorController');
const { Summarization, getPdf } = require('../controllers/summarizationController');
const { UploadPdfFile } = require('../controllers/questionUploadController');

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

describe('EduMatrix Cloudflare Migration Phase 3: Decouple Python Subprocesses Suite', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Native Placement Predictor Engine (replaces pred_model.py)
  // ──────────────────────────────────────────────────────────────────────────

  test('1. Placement Predictor: Predicts "Placed" when marks >= 60 and attendance >= 60', () => {
    const res = predictPlacement({ marks: 75, attendance: 85, branch: 'CSE' });
    assert.equal(res.result, 'Placed');
    assert.equal(res.marks, 75);
    assert.equal(res.attendance, 85);
    assert.equal(res.branch, 'CSE');
  });

  test('2. Placement Predictor: Predicts "Not Placed" when marks < 60', () => {
    const res = predictPlacement({ marks: 59, attendance: 90, branch: 'ECE' });
    assert.equal(res.result, 'Not Placed');
  });

  test('3. Placement Predictor: Predicts "Not Placed" when attendance < 60', () => {
    const res = predictPlacement({ marks: 95, attendance: 58, branch: 'IT' });
    assert.equal(res.result, 'Not Placed');
  });

  test('4. Placement Predictor: Boundary test at exactly 60 marks and 60 attendance', () => {
    const boundaryPlaced = predictPlacement({ marks: 60, attendance: 60 });
    assert.equal(boundaryPlaced.result, 'Placed');

    const boundaryNotPlaced1 = predictPlacement({ marks: 59.9, attendance: 60 });
    assert.equal(boundaryNotPlaced1.result, 'Not Placed');

    const boundaryNotPlaced2 = predictPlacement({ marks: 60, attendance: 59.9 });
    assert.equal(boundaryNotPlaced2.result, 'Not Placed');
  });

  test('5. Placement Predictor: Rejects missing, NaN, or non-numeric inputs', () => {
    assert.throws(
      () => predictPlacement({ marks: 'abc', attendance: 80 }),
      /valid numeric values/
    );

    assert.throws(
      () => predictPlacement({ marks: 70 }),
      /valid numeric values/
    );

    assert.throws(
      () => predictPlacement({}),
      /valid numeric values/
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. AiPredictorController HTTP Contract
  // ──────────────────────────────────────────────────────────────────────────

  test('6. AiPredictorController: Returns 200 with exact frontend prediction contract', async () => {
    const req = {
      body: {
        marks: '85',
        attendance: '90',
        branch: 'Mechanical',
      },
    };
    const res = createMockRes();

    await AiPredictorController(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.prediction.result, 'Placed');
    assert.equal(res.body.message, 'Prediction recieved from the model');
  });

  test('7. AiPredictorController: Rejects malformed payload with 400 Bad Request', async () => {
    const req = { body: { marks: 'not-a-number', attendance: '80' } };
    const res = createMockRes();

    await AiPredictorController(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /valid numeric values/);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Summarization Controller Contract (replaces text_summarization.py)
  // ──────────────────────────────────────────────────────────────────────────

  test('8. Summarization Controller: Rejects request without file with 404', async () => {
    const req = { file: null };
    const res = createMockRes();

    await Summarization(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'File not found');
  });

  test('9. Summarization Service: Fails with 503 when API key is unconfigured', async () => {
    const origGimini = process.env.GIMINI_API_KEY;
    const origGemini = process.env.GEMINI_API_KEY;
    delete process.env.GIMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      await assert.rejects(
        async () => await summarizeDocument({ textPrompt: 'Sample lecture text' }),
        /GEMINI_API_KEY is not configured/
      );
    } finally {
      if (origGimini) process.env.GIMINI_API_KEY = origGimini;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Question Generator Controller Contract (replaces question_generation.py)
  // ──────────────────────────────────────────────────────────────────────────

  test('10. Question Upload Controller: Rejects request without file with 404', async () => {
    const req = { file: null };
    const res = createMockRes();

    await UploadPdfFile(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.message, 'File not found');
  });

  test('11. Question Generation Service: Fails with 503 when API key is unconfigured', async () => {
    const origGimini = process.env.GIMINI_API_KEY;
    const origGemini = process.env.GEMINI_API_KEY;
    delete process.env.GIMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      await assert.rejects(
        async () => await generateQuestionsFromDocument({ textPrompt: 'Sample lecture text' }),
        /GEMINI_API_KEY is not configured/
      );
    } finally {
      if (origGimini) process.env.GIMINI_API_KEY = origGimini;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Zero Subprocess Invariant Verification
  // ──────────────────────────────────────────────────────────────────────────

  test('12. Invariant: None of the Phase 3 migrated controllers import child_process', () => {
    const aiPredictorSource = require('fs').readFileSync(
      require.resolve('../controllers/aiPredictorController'),
      'utf8'
    );
    const summarizationSource = require('fs').readFileSync(
      require.resolve('../controllers/summarizationController'),
      'utf8'
    );
    const questionUploadSource = require('fs').readFileSync(
      require.resolve('../controllers/questionUploadController'),
      'utf8'
    );
    const serviceSource = require('fs').readFileSync(
      require.resolve('../services/documentAiService'),
      'utf8'
    );

    const hasChildProcess = (src) => src.includes('child_process') || /\b(spawn|exec|execSync|fork)\s*\(/.test(src);

    assert.equal(hasChildProcess(aiPredictorSource), false);
    assert.equal(hasChildProcess(summarizationSource), false);
    assert.equal(hasChildProcess(questionUploadSource), false);
    assert.equal(hasChildProcess(serviceSource), false);
  });
});
