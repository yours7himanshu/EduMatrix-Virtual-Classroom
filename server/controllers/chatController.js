// backend/controllers/chatController.js
const Chat = require("../models/messageModel");

exports.createChatMessage = async (data) => {
    const { userId, message, lectureId } = data;
    await Chat.create({ userId, message, lectureId });
};
