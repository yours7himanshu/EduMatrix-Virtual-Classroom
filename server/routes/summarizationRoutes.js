const express = require('express');
const {Summarization,getPdf} = require('../controllers/summarizationController');
const upload = require('../middlewares/multer');


const summarizationRouter = express.Router();


summarizationRouter.post('/summarize',upload.single("pdf"),Summarization);
summarizationRouter.get('/pdf',getPdf);

module.exports = summarizationRouter;