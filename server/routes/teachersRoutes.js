const express = require('express');
const {addTeacher,teacherDetail} = require('../controllers/teacherController');
const isAdminAuthenticated = require('../middlewares/adminAuth');
const teacherRouter = express.Router();


teacherRouter.post('/add-teacher',addTeacher);
teacherRouter.get('/teacher-detail',isAdminAuthenticated,teacherDetail)


module.exports=teacherRouter;