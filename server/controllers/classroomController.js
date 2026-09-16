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

const Classroom = require("../models/classroomModel");
const Admin = require("../models/adminModels");
const mongoose = require("mongoose");

/**
 * Helper to validate a teacher account:
 * Must exist, be active, have role 'Teacher', and match the caller's institutionId.
 */
async function validateTeacherAccount(teacherId, callerInstitutionId) {
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return { valid: false, status: 400, message: "Invalid teacher ID format" };
  }

  const teacher = await Admin.findById(teacherId);
  if (!teacher) {
    return { valid: false, status: 404, message: "Assigned teacher not found" };
  }

  if (teacher.isActive === false) {
    return { valid: false, status: 400, message: "Assigned teacher account is inactive" };
  }

  const teacherRole = (teacher.role || "").toLowerCase();
  if (teacherRole !== "teacher") {
    return { valid: false, status: 400, message: "Assigned staff member must have Teacher role" };
  }

  const teacherInstId = teacher.institutionId ? teacher.institutionId.toString() : teacher._id.toString();
  if (teacherInstId !== callerInstitutionId.toString()) {
    return { valid: false, status: 403, message: "Forbidden: Assigned teacher belongs to a different institution" };
  }

  return { valid: true, teacher };
}

/**
 * POST /api/classrooms
 * Create a new classroom within the caller's institution.
 */
const createClassroom = async (req, res) => {
  try {
    const { title, courseCode, description, branch, batch, teacherId } = req.body;
    const userRole = (req.user?.role || "").toLowerCase();
    const callerInstitutionId = req.user?.institutionId;

    if (!callerInstitutionId) {
      return res.status(403).json({
        success: false,
        message: "Caller is not bound to a valid institution",
      });
    }

    if (!["director", "registrar", "teacher", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only institutional staff can create classrooms",
      });
    }

    if (!title || !courseCode || !branch || !batch) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, courseCode, branch, and batch are required",
      });
    }

    // Determine target teacher
    let targetTeacherId;
    if (userRole === "teacher") {
      // Teachers can only create classrooms where they are the instructor
      if (teacherId && teacherId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Teachers cannot create classrooms for other instructors",
        });
      }
      targetTeacherId = req.user.id;
    } else {
      // Directors / Registrars must specify a valid teacher or default to themselves if they hold teacher role
      targetTeacherId = teacherId || req.user.id;
    }

    // Validate the target teacher account
    const validation = await validateTeacherAccount(targetTeacherId, callerInstitutionId);
    if (!validation.valid) {
      return res.status(validation.status).json({
        success: false,
        message: validation.message,
      });
    }

    // Check courseCode uniqueness within this institution
    const normalizedCode = courseCode.trim().toUpperCase();
    const existing = await Classroom.findOne({
      institutionId: callerInstitutionId,
      courseCode: normalizedCode,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Course code '${normalizedCode}' already exists in this institution`,
      });
    }

    const classroom = await Classroom.create({
      title: title.trim(),
      courseCode: normalizedCode,
      description: description ? description.trim() : "",
      institutionId: callerInstitutionId,
      teacherId: targetTeacherId,
      branch: branch.trim(),
      batch: batch.trim(),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      classroom,
      message: "Classroom created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Course code already exists in this institution",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error creating classroom",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms
 * List classrooms scoped to the caller's institution and role.
 */
const getClassrooms = async (req, res) => {
  try {
    const userRole = (req.user?.role || "").toLowerCase();
    const callerInstitutionId = req.user?.institutionId;

    if (!callerInstitutionId) {
      return res.status(403).json({
        success: false,
        message: "Caller is not bound to a valid institution",
      });
    }

    const filter = { institutionId: callerInstitutionId };

    // Teachers only see their own classrooms by default
    if (userRole === "teacher") {
      filter.teacherId = req.user.id;
    } else if (req.query.teacherId) {
      filter.teacherId = req.query.teacherId;
    }

    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.batch) filter.batch = req.query.batch;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

    const classrooms = await Classroom.find(filter)
      .populate("teacherId", "directorName email role")
      .populate("institutionId", "name centerCode")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: classrooms.length,
      classrooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving classrooms",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms/:id
 * Retrieve a specific classroom with tenant isolation checks.
 */
const getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID format" });
    }

    const classroom = await Classroom.findById(id)
      .populate("teacherId", "directorName email role")
      .populate("institutionId", "name centerCode");

    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Verify institution tenant boundary
    if (classroom.institutionId._id.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cross-institution classroom access is prohibited",
      });
    }

    // If caller is teacher, verify ownership
    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "teacher" && classroom.teacherId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not the assigned instructor for this classroom",
      });
    }

    return res.status(200).json({
      success: true,
      classroom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving classroom",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/classrooms/:id/reassign
 * Reassign a classroom to a different active teacher in the same institution.
 * Only accessible to Directors / Registrars.
 */
const reassignClassroomTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { newTeacherId } = req.body;
    const userRole = (req.user?.role || "").toLowerCase();
    const callerInstitutionId = req.user?.institutionId;

    if (!["director", "registrar", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only institutional administrators can reassign classrooms",
      });
    }

    if (!newTeacherId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: newTeacherId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID format" });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Tenant boundary check
    if (classroom.institutionId.toString() !== callerInstitutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cross-institution classroom modification is prohibited",
      });
    }

    // Validate target new teacher
    const validation = await validateTeacherAccount(newTeacherId, callerInstitutionId);
    if (!validation.valid) {
      return res.status(validation.status).json({
        success: false,
        message: validation.message,
      });
    }

    classroom.teacherId = newTeacherId;
    await classroom.save();

    return res.status(200).json({
      success: true,
      classroom,
      message: "Classroom successfully reassigned to new teacher",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error reassigning classroom",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/classrooms/:id/status
 * Toggle or update the isActive status of a classroom.
 */
const updateClassroomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const userRole = (req.user?.role || "").toLowerCase();
    const callerInstitutionId = req.user?.institutionId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID format" });
    }

    const classroom = await Classroom.findById(id);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    if (classroom.institutionId.toString() !== callerInstitutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cross-institution classroom modification is prohibited",
      });
    }

    // Teachers can only modify their own classroom
    if (userRole === "teacher" && classroom.teacherId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not the instructor for this classroom",
      });
    }

    classroom.isActive = isActive !== undefined ? Boolean(isActive) : !classroom.isActive;
    await classroom.save();

    return res.status(200).json({
      success: true,
      classroom,
      message: `Classroom status updated to ${classroom.isActive ? "active" : "inactive"}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error updating classroom status",
      error: error.message,
    });
  }
};

module.exports = {
  createClassroom,
  getClassrooms,
  getClassroomById,
  reassignClassroomTeacher,
  updateClassroomStatus,
};
