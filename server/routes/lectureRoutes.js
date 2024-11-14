// backend/routes/lectureRoutes.js
const express = require("express");
const { createLecture } = require("../controllers/lectureController");

const router = express.Router();
router.post("/", createLecture);

module.exports = router;
