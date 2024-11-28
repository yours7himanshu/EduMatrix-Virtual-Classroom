const express = require('express');
const {enrollStudent} = require('../controllers/studentController');
const studentRouter = express.Router();
const upload = require('../middlewares/multer');

studentRouter.post("/enroll-student", upload.single("avatar"), enrollStudent);
// studentRouter.get('/student-detail',studentDetail);

module.exports=studentRouter;