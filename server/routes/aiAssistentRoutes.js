const express = require('express');
const aiAssistent = require('../controllers/aiAssistentController');

const aiRouter = express.Router();


aiRouter.post('/ai-assistent',aiAssistent);

module.exports=aiRouter;