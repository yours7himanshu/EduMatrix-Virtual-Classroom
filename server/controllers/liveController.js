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

const { AccessToken } = require("livekit-server-sdk");
const mongoose = require("mongoose");
const Classroom = require("../models/classroomModel");
const LiveSession = require("../models/liveSessionModel");
const Admin = require("../models/adminModels");
const Student = require("../models/studentModels");
const Enrollment = require("../models/enrollmentModel");

/**
 * POST /api/live/token
 * Generate a secure, cryptographically signed LiveKit participant access token.
 * Never trusts role, identity, or authorization claims from the client body/headers.
 */
const generateLiveToken = async (req, res) => {
  try {
    // 1. Verify LiveKit server-side configuration safely
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL || null;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: "LiveKit server configuration error: missing API credentials",
      });
    }

    // 2. Derive user identity and role strictly from server-side JWT context (req.user)
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = (user.role || "").toLowerCase();
    const userId = user.id.toString();

    // 3. Extract and validate classroomId (strictly ignore any client-supplied role/identity)
    const { classroomId } = req.body || {};
    if (!classroomId || !mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing classroom ID",
      });
    }

    // 4. Retrieve Classroom and verify it is active
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    if (!classroom.isActive) {
      return res.status(400).json({
        success: false,
        message: "Classroom is currently inactive",
      });
    }

    const classroomInstId = classroom.institutionId ? classroom.institutionId.toString() : null;

    // 5. Role-specific institutional and authorization checks
    let displayName = user.name || "";
    let isTeacherHost = false;

    if (userRole === "teacher") {
      // Cross-institution check
      const userInstId = user.institutionId ? user.institutionId.toString() : null;
      if (!userInstId || userInstId !== classroomInstId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cross-institution classroom access is prohibited",
        });
      }

      // Must be the assigned teacher for this classroom
      if (classroom.teacherId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not the assigned teacher for this classroom",
        });
      }

      // Verify teacher account is active in database
      const teacher = await Admin.findById(userId);
      if (!teacher || teacher.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "Forbidden: Assigned teacher account is inactive or not found",
        });
      }

      displayName = teacher.directorName || user.name || "Teacher";
      isTeacherHost = true;
    } else if (userRole === "student") {
      // Verify student record and institutional affiliation
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student record not found",
        });
      }

      // Verify Student belongs to the same institution
      if (student.institutionId && student.institutionId.toString() !== classroomInstId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Student belongs to another institution",
        });
      }

      // Verify active enrollment in the classroom
      const enrollment = await Enrollment.findOne({
        classroomId: classroom._id,
        studentId: student._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not enrolled in this classroom",
        });
      }

      if (enrollment.status === "dropped") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Your enrollment in this classroom has been dropped",
        });
      }

      if (enrollment.status !== "enrolled") {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Active enrollment required",
        });
      }

      displayName = student.name || user.name || "Student";
      isTeacherHost = false;
    } else if (userRole === "director" || userRole === "admin") {
      // Directors / Registrars within the same institution
      const userInstId = user.institutionId ? user.institutionId.toString() : null;
      if (!userInstId || userInstId !== classroomInstId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Cross-institution classroom access is prohibited",
        });
      }

      const isAssigned = classroom.teacherId.toString() === userId;
      isTeacherHost = isAssigned;
      displayName = user.name || "Director";
    } else {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Unsupported user role for live sessions",
      });
    }

    // 6. Verify that the classroom has an active LiveSession
    const activeSession = await LiveSession.findOne({
      classroomId: classroom._id,
      status: "active",
    });

    if (!activeSession) {
      return res.status(404).json({
        success: false,
        message: "No active live session found for this classroom",
      });
    }

    // 7. Generate participant identity strictly server-side
    const participantIdentity = `${userRole}_${userId}`;

    // 8. Construct LiveKit AccessToken with minimum required permissions
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: displayName,
      metadata: JSON.stringify({
        userId,
        role: userRole,
        classroomId: classroom._id.toString(),
        institutionId: classroomInstId,
        sessionId: activeSession._id.toString(),
      }),
      ttl: "4h",
    });

    if (isTeacherHost) {
      // Teacher / Host permissions: roomAdmin to manage the session
      token.addGrant({
        roomJoin: true,
        room: activeSession.roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: true,
        roomRecord: true,
      });
    } else {
      // Student / Participant permissions: participant only, roomAdmin false
      token.addGrant({
        roomJoin: true,
        room: activeSession.roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: false,
      });
    }

    const jwtToken = await token.toJwt();

    return res.status(200).json({
      success: true,
      token: jwtToken,
      livekitUrl,
      roomName: activeSession.roomName,
      participant: {
        identity: participantIdentity,
        name: displayName,
        role: userRole,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error generating live token",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

module.exports = {
  generateLiveToken,
};
