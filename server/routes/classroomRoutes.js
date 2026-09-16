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

const express = require("express");
const {
  createClassroom,
  getClassrooms,
  getClassroomById,
  reassignClassroomTeacher,
  updateClassroomStatus,
} = require("../controllers/classroomController");
const {
  enrollStudentInClassroom,
  getClassroomRoster,
  updateEnrollmentStatus,
  getMyEnrolledClassrooms,
} = require("../controllers/enrollmentController");
const {
  startLiveSession,
  endLiveSession,
  getActiveLiveSession,
  getHistoricalSessions,
} = require("../controllers/liveSessionController");
const authenticateUser = require("../middlewares/unifiedAuth");

const router = express.Router();

// All classroom endpoints require authentication
router.use(authenticateUser);

// Student read-only view of active enrollments
router.get("/my/enrolled", getMyEnrolledClassrooms);

// Classroom CRUD & status
router.post("/", createClassroom);
router.get("/", getClassrooms);
router.get("/:id", getClassroomById);
router.patch("/:id/reassign", reassignClassroomTeacher);
router.patch("/:id/status", updateClassroomStatus);

// Classroom Roster & Student Enrollment management
router.post("/:classroomId/enrollments", enrollStudentInClassroom);
router.get("/:classroomId/enrollments", getClassroomRoster);
router.patch("/:classroomId/enrollments/:studentId", updateEnrollmentStatus);

// LiveSession lifecycle endpoints
router.post("/:classroomId/sessions", startLiveSession);
router.get("/:classroomId/sessions", getHistoricalSessions);
router.get("/:classroomId/sessions/active", getActiveLiveSession);
router.post("/:classroomId/sessions/:sessionId/end", endLiveSession);
router.patch("/:classroomId/sessions/:sessionId/end", endLiveSession);

module.exports = router;
