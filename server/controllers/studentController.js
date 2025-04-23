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


const Student = require("../models/studentModels");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;

const enrollStudent = async (req, res) => {
  try {
    const {
      name,
      rollNo,
      fatherName,
      phoneNo,
      branch,
      batch,
      email,
      password,
    } = req.body;

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is required",
      });
    }

    // Validate if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ rollNo }, { email }],
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with the same roll number or email already exists",
      });
    }

    let avatarUrl;

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

      avatarUrl = result.secure_url;
    } catch (uploadError) {
      console.error("Error uploading avatar to Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading avatar",
        error: uploadError.message,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = await Student.create({
      name,
      rollNo,
      fatherName,
      phoneNo,
      branch,
      batch,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    res.status(201).json({
      success: true,
      student,
      message: "Student successfully enrolled",
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling student",
      error: error.message,
    });
  }
};

// Now writing code for showing details of the students
const getStudents = async(req,res)=>{
try{
  const studentdetails = await Student.find();

  return res.status(200).json({
    success:true,
    studentdetails,
    message:"Here are the details of the students",
  })
}
catch(error){
  return res.status(500).json({
    success:false,
    message:"Some error occured on fetching the student details"
  })
}

}
const getStudentById = async(req,res)=>{
  try{
    const {studentId} = req.body;
    const studentdetails = await Student.findById(studentId);
    if(!studentdetails){
      return res.status(404).json({
        success:false,
        message:"Student not found"
      })
    }
    return res.json({
      success:true,
      studentdetails,
      message:"Here are the details of the student",
    })
  }catch(error){
    return res.status(500).json({
      success:false,
      message:"Some error occured on fetching the student details"
    })
  }
}

module.exports = { enrollStudent ,getStudents,getStudentById};
