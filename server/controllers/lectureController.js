// backend/controllers/lectureController.js
const Lecture = require("../models/Lecutre");

exports.createLecture = async (req, res) => {
    const { title, description, host } = req.body;
    try {
        const lecture = await Lecture.create({ title, description, host });
        res.status(201).json(lecture);
    } catch (error) {
        res.status(500).json({ message: "Failed to create lecture" });
    }
};
