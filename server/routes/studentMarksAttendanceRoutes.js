const express = require('express');
const StudentMarksController = require('../controllers/studentMarksResult');

const router = express.Router();


router.post('/add-student-marks-attendance',StudentMarksController);

module.exports = router;
