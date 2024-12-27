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
