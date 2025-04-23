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
const cloudinary = require('cloudinary').v2;
const Assignment = require("../models/assignmentModels");

// code for posting the assignment from the admin panel to the student server
const postAssignment = async (req, res) => {
  const { title, description, questions, deadline } = req.body;

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Pdf file is required",
      });
    }

    const existingAssignment = await Assignment.findOne({ title });
    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exist",
      });
    }

    let pdfUrl;

    // Upload avatar to Cloudinary
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer); // Pass the buffer to the stream
      });

      pdfUrl = result.secure_url;
    } catch (uploadError) {
      console.error("Error uploading avatar to Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading avatar",
        error: uploadError.message,
      });
    }


    const assignment = await Assignment.create({
      title,
      description,
      questions,
      deadline,
      pdfUrl,
    });

    return res.status(201).json({
      success: true,
      assignment,
      message: "Assignment Successfully posted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occured on posting the Assignment",
    });
  }
};

// code for getting the assignment in the student server
const getAssignment = async (req, res) => {
  try {
    const studentAssignment = await Assignment.find();

    if (!studentAssignment) {
      return res.status(404).json({
        success: false,
        message: "Currently no assignment to show",
      });
    }

    return res.status(200).json({
        success:true,
        studentAssignment,
      })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occured on getting the assignments",
    });
  }
};

// deleting the assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const delAssignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!delAssignment) {
      return res.status(404).json({
        success: false,
        message: "No assignment found to delete",
      });
    }
    return res.status({
      success: true,
      message: "Assignment Successfully  deleted",
    });
  } catch (error) {
    return res.status({
      success: false,
      message: "Some error occured in deleting the assignment",
    });
  }
};

module.exports = { postAssignment, getAssignment, deleteAssignment };
