const express = require('express');
const announcement = require('../controllers/annoncementController')

const assignmentRouter = express.Router();

assignmentRouter.post('/announcement',announcement);


module.exports=assignmentRouter;