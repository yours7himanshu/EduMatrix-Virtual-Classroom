const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [String],
      correctAnswer: { type: Number, required: true },
    },
  ],
});

const Quiz = mongoose.model("quiz",quizSchema);
module.exports=Quiz;
