// server/routes/aiRoutes.js
const express = require("express");
const { generateContent } = require("../controllers/aiController");
const router = express.Router();

router.post("/generate", generateContent);

module.exports = router;