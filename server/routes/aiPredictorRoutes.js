const express = require('express');
const AiPredictorController = require('../controllers/aiPredictorController');

const router = express.Router();

router.post('/aiPredictor',AiPredictorController);

module.exports = router;
