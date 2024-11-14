// backend/models/Chat.js
const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    userId: String,
    message: String,
    lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", ChatSchema);
