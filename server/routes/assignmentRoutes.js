const express = require('express');
const {postAssignment,getAssignment,deleteAssignment}=require("../controllers/assignmentController")
const assignmentRouter = express.Router();

assignmentRouter.post('/postAssignment',postAssignment);
assignmentRouter.get('/getAssignment',getAssignment);
assignmentRouter.delete('/assignment/:id',deleteAssignment);


module.exports=assignmentRouter;