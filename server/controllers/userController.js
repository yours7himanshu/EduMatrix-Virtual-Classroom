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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const loginUser = async (req, res) => {
  const { email, password } = req.body;
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
    const token = jwt.sign(
      { email: email, userId: user._id },
      process.env.JWT_SECRET
     
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
    console.log("Some error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {  loginUser };
