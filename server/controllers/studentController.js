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
const Admin = require("../models/adminModels");
const Institution = require("../models/institutionModel");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

/**
 * Authoritatively resolves the authenticated Registrar and their bound institutionId
 * for student enrollment operations.
 *
 * This is a parallel of getAuthenticatedRegistrar() in adminFeeStructureController.js.
 * Never trusts req.body.institutionId or any client-supplied institution identifier.
 *
 * @param {Object} req - Express request (must have req.user set by isAdminAuthenticated middleware)
 * @param {Object} res - Express response
 * @returns {Promise<Object|null>} Authoritative registrar context or null if rejected (response already sent)
 */
async function resolveRegistrarForEnrollment(req, res) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Authentication is required to enroll students.",
    });
    return null;
  }

  const adminId = req.user.id || req.user._id;
  let admin = null;

  if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
    try {
      admin = await Admin.findById(adminId).lean();
    } catch (_) {
      // Continue gracefully — unit tests mock DB via module-level stubs
    }
  }

  // Resolve role and active status from DB record (authoritative) with JWT fallback
  const role = admin ? admin.role : req.user.role;
  const isActive = admin
    ? admin.isActive !== false
    : typeof req.user.isActive === "boolean"
    ? req.user.isActive
    : true;

  if (role !== "Registrar") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Only a Registrar may enroll students.",
    });
    return null;
  }

  if (!isActive) {
    res.status(403).json({
      success: false,
      message: "Forbidden: Registrar account is inactive.",
    });
    return null;
  }

  // Resolve institution from DB record (authoritative) with JWT fallback
  const rawInstitutionId = admin ? admin.institutionId : req.user.institutionId;

  if (!rawInstitutionId || !mongoose.Types.ObjectId.isValid(rawInstitutionId)) {
    res.status(400).json({
      success: false,
      message:
        "Registrar is not associated with an authorized institution. Contact a Super Admin to link your account to an institution before enrolling students.",
    });
    return null;
  }

  return {
    _id: admin ? admin._id : adminId,
    email: admin ? admin.email : req.user.email,
    role,
    institutionId: new mongoose.Types.ObjectId(rawInstitutionId),
  };
}

/**
 * POST /api/v5/enroll-student
 *
 * Requires: isAdminAuthenticated middleware + Registrar role.
 *
 * Creates a new Student and stamps it with the authenticated Registrar's institutionId.
 * Any client-supplied institutionId in req.body is completely ignored.
 */
const enrollStudent = async (req, res) => {
  try {
    // ── 1. Resolve Registrar identity (auth + role + tenancy) ──────────────
    const registrar = await resolveRegistrarForEnrollment(req, res);
    if (!registrar) return; // response already sent

    // ── 2. Extract student fields — institutionId is NOT taken from body ───
    const { name, rollNo, fatherName, phoneNo, branch, batch, email, password } = req.body;

    // ── 3. Require avatar ──────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is required.",
      });
    }

    // ── 4. Duplicate check ─────────────────────────────────────────────────
    const existingStudent = await Student.findOne({
      $or: [{ rollNo: Number(rollNo) }, { email }],
    });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "A student with the same roll number or email already exists.",
      });
    }

    // ── 5. Upload avatar ───────────────────────────────────────────────────
    let avatarUrl;
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      avatarUrl = result.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Error uploading avatar.",
        error: uploadError.message,
      });
    }

    // ── 6. Hash password ───────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── 7. Create student — institutionId comes ONLY from authenticated registrar ──
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
      institutionId: registrar.institutionId, // SERVER-AUTHORITATIVE — never from body
    });

    // ── 8. Resolve institution name for response ───────────────────────────
    let institutionName = null;
    try {
      const inst = await Institution.findById(registrar.institutionId).lean();
      institutionName = inst ? inst.name : null;
    } catch (_) {
      // Non-critical
    }

    return res.status(201).json({
      success: true,
      message: "Student successfully enrolled.",
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        branch: student.branch,
        batch: student.batch,
        email: student.email,
      },
      institution: {
        id: registrar.institutionId,
        name: institutionName,
      },
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return res.status(500).json({
      success: false,
      message: "Error enrolling student.",
      error: error.message,
    });
  }
};

/**
 * GET /api/v5/student-detail
 *
 * Requires: isAdminAuthenticated middleware + Registrar role.
 *
 * Returns only students belonging to the authenticated Registrar's institution.
 * Backend enforces tenant scoping — never returns all students.
 */
const getStudents = async (req, res) => {
  try {
    const registrar = await resolveRegistrarForEnrollment(req, res);
    if (!registrar) return;

    const students = await Student.find({
      institutionId: registrar.institutionId,
    })
      .select("-password")
      .lean();

    return res.status(200).json({
      success: true,
      count: students.length,
      studentdetails: students,
      message: "Students for your institution retrieved successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching student details.",
    });
  }
};

/**
 * POST /api/v5/student-byid
 * Existing endpoint — unchanged behaviour.
 */
const getStudentById = async (req, res) => {
  try {
    const studentId = req.studentId || req.body.studentId;
    const studentdetails = await Student.findById(studentId).select("-password");
    if (!studentdetails) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    return res.json({
      success: true,
      studentdetails,
      message: "Here are the details of the student",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occurred on fetching the student details",
    });
  }
};

module.exports = { enrollStudent, getStudents, getStudentById, resolveRegistrarForEnrollment };
