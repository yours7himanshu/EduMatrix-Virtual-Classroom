const express = require('express');
const {register,loginUser}=require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/register',register);
userRouter.post('/login',loginUser);

module.exports=userRouter;