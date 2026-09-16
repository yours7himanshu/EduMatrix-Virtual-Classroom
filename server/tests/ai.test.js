const test = require('node:test');
const assert = require('node:assert');
const { generateContent } = require('../controllers/aiController');

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

test('AI Controller Reliability Suite', async (t) => {
  await t.test('1. Rejects missing or empty prompt with 400', async () => {
    const req = { body: {} };
    const res = createMockRes();

    await generateContent(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.error, /prompt string is required/);
  });

  await t.test('2. Rejects whitespace-only prompt with 400', async () => {
    const req = { body: { prompt: '   ' } };
    const res = createMockRes();

    await generateContent(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
  });

  await t.test('3. Returns 503 when API key is unconfigured instead of crashing', async () => {
    const origGimini = process.env.GIMINI_API_KEY;
    const origGemini = process.env.GEMINI_API_KEY;
    delete process.env.GIMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    try {
      const req = { body: { prompt: 'Explain quantum computing' } };
      const res = createMockRes();

      await generateContent(req, res);

      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.data.success, false);
      assert.match(res.data.error, /AI service is currently unavailable/);
    } finally {
      if (origGimini) process.env.GIMINI_API_KEY = origGimini;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
    }
  });
});
