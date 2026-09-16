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

const authStudent = (req, res, next) => {
  const token =
    req.headers.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : (req.cookies && req.cookies['token']));

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not authorized",
    });
  }
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.studentId = decodedData.userId;
    req.studentEmail = decodedData.email;
    req.user = {
      id: decodedData.userId,
      email: decodedData.email,
      role: decodedData.role || "student",
      institutionId: decodedData.institutionId || null,
      name: decodedData.name,
    };
    if (!req.body) {
      req.body = {};
    }
    req.body.studentId = decodedData.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authStudent };