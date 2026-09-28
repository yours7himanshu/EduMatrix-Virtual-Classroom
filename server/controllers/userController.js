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

const Students = require("../models/studentModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sanitizeMongoUri } = require("../db/db");



const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // Reject missing credentials explicitly: without this, an empty or
  // malformed body would query with `undefined` (potentially matching an
  // arbitrary user) and crash password verification with a misleading 500.
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const user = await Students.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not Exist.Please Sign Up",
      });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    // JWT configuration is validated distinctly from database failures so a
    // missing secret can never surface as a generic 500 or be confused with
    // invalid credentials. No secret material is ever included in responses.
    if (!process.env.JWT_SECRET) {
      console.error("Login failed: JWT configuration missing (JWT_SECRET binding not set)");
      return res.status(503).json({
        success: false,
        message: "Service unavailable: authentication is not configured.",
      });
    }
    const token = jwt.sign(
      {
        email: email,
        userId: user._id,
        role: user.role || "student",
        name: user.name,
        institutionId: user.institutionId ? user.institutionId.toString() : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      token,
      message: "Login Successfull",
    });
  } catch (error) {
    // Sanitized server-side diagnostic: error category without connection
    // details or credentials. The client always receives the safe contract.
    console.error("Login request failed:", sanitizeMongoUri(error.message || String(error)));
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {  loginUser };
