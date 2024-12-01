const express = require('express');
const router = express.Router();
const { announcement, displayAnnouncement } = require('../controllers/annoncementController');

router.post('/announcement', announcement);
router.get('/displayAnnouncement', displayAnnouncement);

module.exports = router;