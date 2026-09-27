
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

const express = require('express');
const router = express.Router();
const Quiz = require('../models/quizModels');
const { notifyClients } = require('../websockets/notifyClients');
const isAdminAuthenticated = require('../middlewares/adminAuth');

/**
 * Builds a safe public view of a quiz question.
 * Strips `correctAnswer` so students cannot see answer-key data in broadcasts or GET responses.
 */
const sanitizeQuestion = (q) => ({
  _id: q._id,
  questionText: q.questionText,
  options: Array.isArray(q.options) ? q.options : [],
});

/**
 * Builds a safe public view of a full quiz document.
 * Suitable for broadcasting to students and returning via GET /quizzes.
 */
const sanitizeQuizForStudent = (quiz) => ({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  institutionId: quiz.institutionId,
  questions: Array.isArray(quiz.questions) ? quiz.questions.map(sanitizeQuestion) : [],
});

// GET /quizzes
// Returns quizzes with answer keys stripped (safe for student consumption).
// No authentication required on GET — students browse available quizzes.
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    const sanitized = quizzes.map(sanitizeQuizForStudent);
    res.status(200).json(sanitized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// POST /quizzes
// Protected: requires a valid Admin/Teacher JWT via isAdminAuthenticated.
// `institutionId` is derived exclusively from the authenticated user's verified token —
// any `institutionId` field in req.body is silently ignored.
router.post('/quizzes', isAdminAuthenticated, async (req, res) => {
  try {
    // Derive institution strictly from the verified token — never from client input.
    const institutionId = req.user && req.user.institutionId
      ? req.user.institutionId.toString()
      : null;

    if (!institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Quiz creation requires an institutional account. No institution linked to this user.',
      });
    }

    // Build the quiz document. Explicitly exclude any client-supplied institutionId or createdBy.
    const { title, description, questions } = req.body;

    const quiz = new Quiz({
      title,
      description,
      questions,
      institutionId,                          // server-side only
      createdBy: req.user.id || req.user.email, // audit trail
    });

    await quiz.save();

    // Build a sanitized broadcast payload that contains NO answer-key fields.
    const broadcastPayload = sanitizeQuizForStudent(quiz);

    // Broadcast new quiz event via primary Socket.IO, strictly scoped to the institution room.
    // There is NO global fallback — if institutionId is absent the quiz is not broadcast.
    const io = req.app ? req.app.get('io') : null;
    if (io) {
      io.to(`inst_${institutionId}`).emit('new-quiz', broadcastPayload);
    }

    // Notify legacy raw WebSocket clients using the sanitized payload (no answer keys).
    notifyClients(broadcastPayload);

    // Return the full document (with correctAnswer) only to the authenticated creator.
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// POST /quizzes/:id/submit
// Submit quiz answers and receive scored results.
// correctAnswer comparisons happen server-side; only isCorrect is returned to the client.
router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    const quizId = req.params.id;

    if (!quizId || !String(quizId).match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format',
      });
    }

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Answers are required as a key-value object',
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    let score = 0;
    const total = quiz.questions ? quiz.questions.length : 0;
    const details = [];

    if (quiz.questions && Array.isArray(quiz.questions)) {
      quiz.questions.forEach((q) => {
        const qId = q._id ? q._id.toString() : '';
        const selectedOption = answers[qId];
        const isCorrect =
          selectedOption !== undefined &&
          Number(selectedOption) === Number(q.correctAnswer);

        if (isCorrect) {
          score++;
        }

        // Return isCorrect flag but NOT the raw correctAnswer to prevent answer fishing.
        details.push({
          questionId: qId,
          questionText: q.questionText,
          selected: selectedOption !== undefined ? Number(selectedOption) : null,
          isCorrect,
        });
      });
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      score,
      total,
      percentage,
      details,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate quiz submission',
      error: error.message,
    });
  }
});

module.exports = router;
