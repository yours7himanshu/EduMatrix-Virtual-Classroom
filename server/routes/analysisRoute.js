const express = require('express');
const testFunction = require('../controllers/analysisController');

const analysisRouter = express.Router();

analysisRouter.get('/test',testFunction)


module.exports=analysisRouter;