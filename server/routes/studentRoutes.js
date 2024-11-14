const express = require('express');
const {enrollStudent,studentDetail} = require('../controllers/studentController');
const studentRouter = express.Router();

studentRouter.post("/enroll-student",enrollStudent);
studentRouter.get('/student-detail',studentDetail);

module.exports=studentRouter;