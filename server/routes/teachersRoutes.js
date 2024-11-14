const express = require('express');
const addTeacher = require('../controllers/teacherController')
const teacherRouter = express.Router();


teacherRouter.post('/add-teacher',addTeacher);


module.exports=teacherRouter;