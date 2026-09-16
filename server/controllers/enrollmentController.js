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

const Enrollment = require("../models/enrollmentModel");
const Classroom = require("../models/classroomModel");
const Student = require("../models/studentModels");
const Admin = require("../models/adminModels");
const Institution = require("../models/institutionModel");
const mongoose = require("mongoose");

/**
 * Helper to verify staff authorization over a specific classroom.
 * Enforces institution boundary and teacher ownership rules.
 */
async function verifyClassroomManagementAccess(classroomId, user) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    return { authorized: false, status: 400, message: "Invalid classroom ID format" };
  }

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    return { authorized: false, status: 404, message: "Classroom not found" };
  }

  const userRole = (user?.role || "").toLowerCase();
  const userInstId = user?.institutionId ? user.institutionId.toString() : null;
  const classroomInstId = classroom.institutionId.toString();

  if (userRole === "student") {
    return {
      authorized: false,
      status: 403,
      message: "Forbidden: Students are not permitted to manage enrollments",
    };
  }

  if (!userInstId || userInstId !== classroomInstId) {
    return {
      authorized: false,
      status: 403,
      message: "Forbidden: Cross-institution classroom access is prohibited",
    };
  }

  if (userRole === "teacher") {
    const teacherId = classroom.teacherId.toString();
    if (teacherId !== user.id.toString()) {
      return {
        authorized: false,
        status: 403,
        message: "Forbidden: Teachers can only manage enrollments for their own classrooms",
      };
    }
  }

  return { authorized: true, classroom };
}

/**
 * POST /api/classrooms/:classroomId/enrollments
 * Enroll a student into a classroom.
 */
const enrollStudentInClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { studentId, email, rollNo } = req.body;

    // 1. Authorize caller against the classroom
    const authCheck = await verifyClassroomManagementAccess(classroomId, req.user);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({
        success: false,
        message: authCheck.message,
      });
    }
    const classroom = authCheck.classroom;

    // 2. Identify target student
    let student = null;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    } else if (email) {
      student = await Student.findOne({ email: email.trim().toLowerCase() });
    } else if (rollNo) {
      student = await Student.findOne({ rollNo: Number(rollNo) });
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing student identifier: studentId, email, or rollNo is required",
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found",
      });
    }

    // 3. Handle institution matching / unaffiliated student adoption
    if (student.institutionId) {
      // Student already belongs to an institution; verify it matches
      if (student.institutionId.toString() !== classroom.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cross-institution enrollment is prohibited",
        });
      }
    } else {
      // Student is unaffiliated (institutionId == null).
      // Legitimate enrollment by an authorized staff member safely binds student to this institution.
      student.institutionId = classroom.institutionId;
      await student.save();
    }

    // 4. Check existing enrollment record
    const existing = await Enrollment.findOne({
      classroomId: classroom._id,
      studentId: student._id,
    });

    if (existing) {
      if (existing.status === "enrolled") {
        return res.status(409).json({
          success: false,
          message: "Student is already enrolled in this classroom",
          enrollment: existing,
        });
      }

      // Re-enroll previously dropped student
      existing.status = "enrolled";
      existing.enrolledAt = new Date();
      existing.droppedAt = null;
      await existing.save();

      return res.status(200).json({
        success: true,
        enrollment: existing,
        message: "Student successfully re-enrolled in classroom",
      });
    }

    // 5. Create new enrollment
    const enrollment = await Enrollment.create({
      classroomId: classroom._id,
      studentId: student._id,
      status: "enrolled",
      enrolledAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      enrollment,
      message: "Student successfully enrolled in classroom",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this classroom",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error enrolling student",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms/:classroomId/enrollments
 * Retrieve the roster of students enrolled in a classroom.
 */
const getClassroomRoster = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { status } = req.query;

    const authCheck = await verifyClassroomManagementAccess(classroomId, req.user);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({
        success: false,
        message: authCheck.message,
      });
    }

    const filter = { classroomId };
    if (status) {
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("studentId", "name rollNo email branch batch avatar")
      .sort({ enrolledAt: -1 });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving roster",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/classrooms/:classroomId/enrollments/:studentId
 * Update enrollment status (e.g. drop or re-enroll a student).
 */
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;
    const { status } = req.body;

    if (!["enrolled", "dropped"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status: Must be 'enrolled' or 'dropped'",
      });
    }

    const authCheck = await verifyClassroomManagementAccess(classroomId, req.user);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({
        success: false,
        message: authCheck.message,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid student ID format" });
    }

    const enrollment = await Enrollment.findOne({ classroomId, studentId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment record not found for this student in this classroom",
      });
    }

    enrollment.status = status;
    if (status === "dropped") {
      enrollment.droppedAt = new Date();
    } else {
      enrollment.enrolledAt = new Date();
      enrollment.droppedAt = null;
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      enrollment,
      message: `Student enrollment successfully marked as '${status}'`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error updating enrollment status",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms/my/enrolled
 * Retrieve active classrooms the authenticated student is enrolled in.
 */
const getMyEnrolledClassrooms = async (req, res) => {
  try {
    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: This endpoint is for enrolled students only",
      });
    }

    const enrollments = await Enrollment.find({
      studentId: req.user.id,
      status: "enrolled",
    }).populate({
      path: "classroomId",
      populate: [
        { path: "teacherId", select: "directorName email" },
        { path: "institutionId", select: "name centerCode" },
      ],
    });

    const classrooms = enrollments
      .filter((e) => e.classroomId && e.classroomId.isActive)
      .map((e) => e.classroomId);

    return res.status(200).json({
      success: true,
      count: classrooms.length,
      classrooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving student enrollments",
      error: error.message,
    });
  }
};

module.exports = {
  enrollStudentInClassroom,
  getClassroomRoster,
  updateEnrollmentStatus,
  getMyEnrolledClassrooms,
};
