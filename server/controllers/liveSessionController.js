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

const LiveSession = require("../models/liveSessionModel");
const Classroom = require("../models/classroomModel");
const Admin = require("../models/adminModels");
const Enrollment = require("../models/enrollmentModel");
const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * Generate a cryptographically secure, unique LiveKit room name.
 * Format: live_<classroomId>_<timestamp>_<randomHex>
 */
function generateServerRoomName(classroomId) {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `live_${classroomId}_${timestamp}_${randomSuffix}`;
}

/**
 * Helper to verify staff authorization over classroom live sessions.
 */
async function verifySessionManagementAccess(classroomId, user) {
  if (!mongoose.Types.ObjectId.isValid(classroomId)) {
    return { authorized: false, status: 400, message: "Invalid classroom ID format" };
  }

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) {
    return { authorized: false, status: 404, message: "Classroom not found" };
  }

  if (!classroom.isActive) {
    return { authorized: false, status: 400, message: "Classroom is currently inactive" };
  }

  const userRole = (user?.role || "").toLowerCase();
  const userInstId = user?.institutionId ? user.institutionId.toString() : null;
  const classroomInstId = classroom.institutionId.toString();

  if (userRole === "student") {
    return {
      authorized: false,
      status: 403,
      message: "Forbidden: Students are not permitted to manage live sessions",
    };
  }

  if (!userInstId || userInstId !== classroomInstId) {
    return {
      authorized: false,
      status: 403,
      message: "Forbidden: Cross-institution classroom session access is prohibited",
    };
  }

  // Verify that the assigned teacher is active
  const teacher = await Admin.findById(classroom.teacherId);
  if (!teacher || teacher.isActive === false) {
    return {
      authorized: false,
      status: 400,
      message: "Cannot manage live session: Assigned teacher account is inactive or not found",
    };
  }

  // Teachers can only manage sessions for their own classroom
  if (userRole === "teacher") {
    if (classroom.teacherId.toString() !== user.id.toString()) {
      return {
        authorized: false,
        status: 403,
        message: "Forbidden: Teachers can only start/end live sessions for their own classrooms",
      };
    }
  }

  return { authorized: true, classroom, teacher };
}

/**
 * POST /api/classrooms/:classroomId/sessions
 * Start a new live lecture session.
 */
const startLiveSession = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title } = req.body || {};

    const authCheck = await verifySessionManagementAccess(classroomId, req.user);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({
        success: false,
        message: authCheck.message,
      });
    }
    const classroom = authCheck.classroom;

    // Check for existing active session (prevent duplicate simultaneous sessions)
    const activeSession = await LiveSession.findOne({
      classroomId: classroom._id,
      status: "active",
    });

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: "A live session is already currently active for this classroom",
        session: activeSession,
      });
    }

    // Generate unique LiveKit room name strictly server-side
    const roomName = generateServerRoomName(classroom._id);

    const session = await LiveSession.create({
      classroomId: classroom._id,
      hostTeacherId: classroom.teacherId,
      roomName,
      title: title ? title.trim() : `Live Lecture - ${classroom.title}`,
      status: "active",
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      session,
      message: "Live session started successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error starting live session",
      error: error.message,
    });
  }
};

/**
 * POST /api/classrooms/:classroomId/sessions/:sessionId/end
 * End an active live lecture session.
 */
const endLiveSession = async (req, res) => {
  try {
    const { classroomId, sessionId } = req.params;

    const authCheck = await verifySessionManagementAccess(classroomId, req.user);
    if (!authCheck.authorized) {
      return res.status(authCheck.status).json({
        success: false,
        message: authCheck.message,
      });
    }
    const classroom = authCheck.classroom;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ success: false, message: "Invalid session ID format" });
    }

    const session = await LiveSession.findOne({
      _id: sessionId,
      classroomId: classroom._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Live session not found for this classroom",
      });
    }

    if (session.status === "ended") {
      return res.status(200).json({
        success: true,
        session,
        message: "Live session is already marked as ended",
      });
    }

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      session,
      message: "Live session successfully ended",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error ending live session",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms/:classroomId/sessions/active
 * Retrieve the currently active live session for a classroom.
 * Accessible to authorized staff and enrolled students.
 */
const getActiveLiveSession = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID format" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const userRole = (req.user?.role || "").toLowerCase();

    // Verify caller access rights
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        classroomId: classroom._id,
        studentId: req.user.id,
        status: "enrolled",
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You must be enrolled in this classroom to check live sessions",
        });
      }
    } else {
      // Staff access check
      const userInstId = req.user?.institutionId ? req.user.institutionId.toString() : null;
      if (!userInstId || userInstId !== classroom.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cross-institution classroom access is prohibited",
        });
      }
    }

    const activeSession = await LiveSession.findOne({
      classroomId: classroom._id,
      status: "active",
    }).populate("hostTeacherId", "directorName email role");

    return res.status(200).json({
      success: true,
      hasActiveSession: !!activeSession,
      session: activeSession || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error checking active session",
      error: error.message,
    });
  }
};

/**
 * GET /api/classrooms/:classroomId/sessions
 * List all historical sessions for a classroom.
 */
const getHistoricalSessions = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ success: false, message: "Invalid classroom ID format" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const userRole = (req.user?.role || "").toLowerCase();
    if (userRole === "student") {
      const enrollment = await Enrollment.findOne({
        classroomId: classroom._id,
        studentId: req.user.id,
        status: "enrolled",
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not enrolled in this classroom",
        });
      }
    } else {
      const userInstId = req.user?.institutionId ? req.user.institutionId.toString() : null;
      if (!userInstId || userInstId !== classroom.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cross-institution access prohibited",
        });
      }
    }

    const sessions = await LiveSession.find({ classroomId: classroom._id })
      .populate("hostTeacherId", "directorName email role")
      .sort({ startedAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving historical sessions",
      error: error.message,
    });
  }
};

module.exports = {
  startLiveSession,
  endLiveSession,
  getActiveLiveSession,
  getHistoricalSessions,
};
