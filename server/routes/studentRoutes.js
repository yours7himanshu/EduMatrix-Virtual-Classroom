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

const express = require('express');
const { enrollStudent, getStudents, getStudentById } = require('../controllers/studentController');
const studentRouter = express.Router();
const upload = require('../middlewares/multer');
const { authStudent } = require('../middlewares/auth');
const isAdminAuthenticated = require('../middlewares/adminAuth');

// ── Registrar-only routes (authentication + Registrar role enforced in controller) ──

// POST /api/v5/enroll-student
// Protected: requires Registrar JWT. Controller verifies role + institutionId from DB.
studentRouter.post(
  "/enroll-student",
  isAdminAuthenticated,
  upload.single("avatar"),
  enrollStudent
);

// GET /api/v5/student-detail
// Protected: returns only students from the authenticated Registrar's institution.
studentRouter.get('/student-detail', isAdminAuthenticated, getStudents);

// POST /api/v5/student-byid
// Student self-lookup — unchanged.
studentRouter.post('/student-byid', authStudent, getStudentById);

module.exports = studentRouter;