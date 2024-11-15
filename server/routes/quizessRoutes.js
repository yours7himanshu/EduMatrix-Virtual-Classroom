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

// Add a new quiz
router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();

    notifyClients(quiz); // Notify all connected clients
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

module.exports = router;
