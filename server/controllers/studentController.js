const Student = require('../models/studentModels');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

const enrollStudent = async (req, res) => {
    const { name, rollNo, fatherName, phoneNo, branch, avatar, batch, email, password } = req.body;

    try {

        // Check if student with the same rollNo or email exists
        const existingStudent = await Student.findOne({ $or: [{ rollNo }, { email }] });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "Student with the same roll number or email already exists"
            });
        }


        const avatarResult = await cloudinary.uploader.upload(avatar, { resource_type: "image" });

       
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
            avatar: avatarResult.secure_url
        });

        return res.status(201).json({
            success: true,
            student,
            message: "Student successfully enrolled"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error enrolling student",
            error: error.message
        });
    }
};

const studentDetail = async (req, res) => {
    try {
        const students = await Student.find();
        return res.status(200).json({
            success: true,
            students,
            message: "Student details retrieved successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error retrieving student details",
            error: error.message
        });
    }
};

module.exports = { enrollStudent, studentDetail };
