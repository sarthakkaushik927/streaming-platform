const express = require('express');
const { chat } = require('../../controllers/chatbotController');
const { chatLimiter } = require('../../middlewares/rateLimiter.js');

const router = express.Router();

router.post('/', chatLimiter, chat);

module.exports = router;
