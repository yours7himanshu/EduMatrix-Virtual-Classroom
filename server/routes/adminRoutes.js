const express = require('express');
const {collegeRegister,collegeLogin} = require('../controllers/adminController');

const adminRouter = express.Router();


adminRouter.post('/admin-login',collegeLogin);
adminRouter.post('/admin-register',collegeRegister);


module.exports=adminRouter;