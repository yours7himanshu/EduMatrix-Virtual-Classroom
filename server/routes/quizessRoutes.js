
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
