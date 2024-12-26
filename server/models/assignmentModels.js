const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
});

const Assignment = mongoose.model("assignment", assignmentSchema);
module.exports = Assignment;
