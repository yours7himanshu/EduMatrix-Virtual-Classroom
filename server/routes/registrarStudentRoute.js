const express = require('express');
const registrarFeesController = require('../controllers/registrarFeesController');

const router = express.Router();


router.post('/student-fees-data',registrarFeesController);


module.exports=router;
