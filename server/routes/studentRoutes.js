const express = require('express');
const enrollStudent = require('../controllers/studentController');
const studentRouter = express.Router();

studentRouter.post("/enroll-student",enrollStudent);

module.exports=studentRouter;