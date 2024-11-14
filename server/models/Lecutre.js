// backend/models/Lecture.js
const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
    title: String,
    description: String,
    host: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lecture", LectureSchema);
