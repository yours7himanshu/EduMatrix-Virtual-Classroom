// announcementController.js

const Announcement = require('../models/announcementModels');

const announcement = async (req, res) => {
    const { category, course, branch, description } = req.body;

    try {
        const postAnnouncement = await Announcement.create({

            category,
            course,
            branch,
            description
        });

        return res.status(201).json({
            success: true,
            postAnnouncement,
            message: "Announcement Successfully posted"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error Posting the Announcement"
        });
    }
};

const displayAnnouncement = async (req, res) => { 
    try {
        const getAnnouncement = await Announcement.find(); 

        return res.status(200).json({
            success: true,
            getAnnouncement,
            message: "Announcement Successfully displayed"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Some error occurred"
        });
    }
};

module.exports = { announcement, displayAnnouncement }; 
