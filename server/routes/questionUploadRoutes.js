const express = require("express");
const Notesrouter = express.Router();
const {UploadPdfFile} = require("../controllers/questionUploadController");
const upload = require("../middlewares/multer");


Notesrouter.post('/notesUpload',upload.single("pdf"),UploadPdfFile)



module.exports=Notesrouter