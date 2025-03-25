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

const Assignment = require("../models/assignmentModels");

// code for posting the assignment from the admin panel to the student server
const postAssignment = async (req, res) => {
  const { title, description, questions, deadline } = req.body;

  try {
    const existingAssignment = await Assignment.findOne({ title });
    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exist",
      });
    }
    const assignment = await Assignment.create({
      title,
      description,
      questions,
      deadline
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
