const express = require('express');
const assignment = require('../controllers/annoncementController')

const assignmentRouter = express.Router();

assignmentRouter.post('/assignment',assignment);


module.exports=assignmentRouter;