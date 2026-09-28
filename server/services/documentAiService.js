/*
 * EduMatrix Document & Predictive AI Service (Phase 3: Decouple Python Subprocesses)
 * 
 * Replaces Python subprocess spawns (`pred_model.py`, `text_summarization.py`, `question_generation.py`)
 * with edge-compatible native JavaScript algorithms and direct HTTPS AI API integrations.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Predicts placement outcome based on marks, attendance, and branch.
 * Mirrors the exact decision boundary of `pred_model.py` without requiring
 * external Python, Pandas, or Scikit-learn runtimes.
 *
 * Rule: marks >= 60 && attendance >= 60 -> "Placed", otherwise "Not Placed".
 */
function predictPlacement({ marks, attendance, branch }) {
  const numMarks = Number(marks);
  const numAttendance = Number(attendance);

  if (marks === undefined || attendance === undefined || isNaN(numMarks) || isNaN(numAttendance)) {
    throw new Error('Marks and attendance must be valid numeric values.');
  }

  const isPlaced = numMarks >= 60 && numAttendance >= 60;
  return {
    result: isPlaced ? 'Placed' : 'Not Placed',
    marks: numMarks,
    attendance: numAttendance,
    branch: branch || 'General',
  };
}

/**
 * Generates document summary using Gemini multimodal AI (or Groq if configured).
 * Accepts raw file buffer (e.g. PDF) or text string.
 */
async function summarizeDocument({ buffer, mimeType = 'application/pdf', textPrompt }) {
  const apiKey = process.env.GIMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('AI service is currently unavailable: GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemInstruction =
    'You are best topic summarization AI assistant for the students so that no student can fail in the exam. Please provide a clear, comprehensive, and well-structured summary of this study material.';

  const contents = [systemInstruction];

  if (buffer) {
    contents.push({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimeType,
      },
    });
  } else if (textPrompt) {
    contents.push(textPrompt);
  } else {
    throw new Error('No document content or text provided for summarization');
  }

  const result = await model.generateContent(contents);
  return result?.response?.text ? result.response.text() : '';
}

/**
 * Generates practice questions from study materials using Gemini multimodal AI.
 */
async function generateQuestionsFromDocument({ buffer, mimeType = 'application/pdf', textPrompt }) {
  const apiKey = process.env.GIMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('AI service is currently unavailable: GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemInstruction =
    'Act as the best AI teacher assistant and give me the most important questions that can be form from this study material. Include high-yield conceptual questions, short-answer questions, and practical problem questions.';

  const contents = [systemInstruction];

  if (buffer) {
    contents.push({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimeType,
      },
    });
  } else if (textPrompt) {
    contents.push(textPrompt);
  } else {
    throw new Error('No document content or text provided for question generation');
  }

  const result = await model.generateContent(contents);
  return result?.response?.text ? result.response.text() : '';
}

module.exports = {
  predictPlacement,
  summarizeDocument,
  generateQuestionsFromDocument,
};
