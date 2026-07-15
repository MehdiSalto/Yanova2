const express = require('express');
const { registerVisit } = require('../controllers/clickController');

const router = express.Router();

router.post('/visit', registerVisit);

module.exports = router;
