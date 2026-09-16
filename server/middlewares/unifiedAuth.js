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

const jwt = require("jsonwebtoken");

/**
 * Unified authentication middleware supporting both Staff and Student JWTs
 * from cookies, Authorization headers (Bearer), or custom header 'token'.
 */
const authenticateUser = (req, res, next) => {
  try {
    const token =
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null) ||
      req.headers?.token ||
      (req.cookies && req.cookies["token"]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = (decoded.role || "student").toLowerCase();
    const id = decoded.userId || decoded.collegeId || decoded.id;
    const institutionId = decoded.institutionId || decoded.collegeId || null;

    req.user = {
      id: id ? id.toString() : null,
      email: decoded.email,
      role: role,
      institutionId: institutionId ? institutionId.toString() : null,
      name: decoded.name,
    };

    // Maintain backwards compatibility for student-specific controllers
    if (decoded.userId) {
      req.studentId = decoded.userId;
      req.studentEmail = decoded.email;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};

module.exports = authenticateUser;
