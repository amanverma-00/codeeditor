const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const rateLimiter = require("../middleware/rateLimitor");
const solveDoubt = require('../controllers/solveDoubt');

// Rate limit AI requests - 20 requests per minute (AI calls are expensive)
const aiChatLimiter = rateLimiter(20, 60);

aiRouter.post('/chat', userMiddleware, aiChatLimiter, solveDoubt);

module.exports = aiRouter;