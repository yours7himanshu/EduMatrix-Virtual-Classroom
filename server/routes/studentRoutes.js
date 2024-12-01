const express = require('express');
const {enrollStudent,getStudents} = require('../controllers/studentController');
const studentRouter = express.Router();
const upload = require('../middlewares/multer');

studentRouter.post("/enroll-student", upload.single("avatar"), enrollStudent);
studentRouter.get('/student-detail',getStudents);

module.exports=studentRouter;