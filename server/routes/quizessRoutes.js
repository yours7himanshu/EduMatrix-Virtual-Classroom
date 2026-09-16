
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

// Get all quizzes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();

    // Broadcast new quiz event via primary Socket.IO
    const io = req.app ? req.app.get('io') : null;
    if (io) {
      io.emit('new-quiz', quiz);
    }

    notifyClients(quiz); // Notify legacy raw WebSocket clients if any
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});
// Submit quiz answers
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

        details.push({
          questionId: qId,
          questionText: q.questionText,
          selected: selectedOption !== undefined ? Number(selectedOption) : null,
          correctAnswer: q.correctAnswer,
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
