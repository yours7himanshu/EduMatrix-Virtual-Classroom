// announcementController.js

const Assignment = require('../models/announcementModels');

const announcement = async (req, res) => {
    const { category, course, branch, descrition } = req.body;

    try {
        const assignment = await Assignment.create({
            category,
            course,
            branch,
            descrition
        });

        return res.status(201).json({
            success: true,
            assignment,
            message: "Assignment Successfully posted"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Error Posting the Assignment"
        });
    }
};

const displayAnnouncement = async (req, res) => { // fixed typo in function name
    try {
        const display = await Assignment.find(); // fixed typo to use Assignment model

        return res.status(200).json({
            success: true,
            display,
            message: "Announcement Successfully displayed"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Some error occurred"
        });
    }
};

module.exports = { announcement, displayAnnouncement }; // fixed typo in export
