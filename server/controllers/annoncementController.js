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
        // Input validation
        if (!category || !course || !branch || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                details: {
                    category: !category ? "Category is required" : null,
                    course: !course ? "Course is required" : null,
                    branch: !branch ? "Branch is required" : null,
                    description: !description ? "Description is required" : null
                }
            });
        }

        const postAnnouncement = await Announcement.create({
            category,
            course,
            branch,
            description,
            createdAt: new Date(),
            lastModified: new Date()
        });

        return res.status(201).json({
            success: true,
            data: postAnnouncement,
            message: "Announcement successfully posted",
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Announcement creation error:', error);
        return res.status(500).json({
            success: false,
            message: "Error posting the announcement",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const displayAnnouncement = async (req, res) => { 
    try {
        const getAnnouncement = await Announcement.find()
            

        return res.status(200).json({
            success: true,
            getAnnouncement,
            message: "Announcements successfully retrieved",
            
        });
    } catch (error) {
        console.error('Announcement retrieval error:', error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving announcements",
        
        });
    }
};

module.exports = { announcement, displayAnnouncement };
