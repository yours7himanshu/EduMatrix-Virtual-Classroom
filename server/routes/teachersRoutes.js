const express = require('express');
const {addTeacher,teacherDetail} = require('../controllers/teacherController')
const teacherRouter = express.Router();


teacherRouter.post('/add-teacher',addTeacher);
teacherRouter.get('/teacher-detail',teacherDetail)


module.exports=teacherRouter;