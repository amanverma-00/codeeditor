const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const rateLimiter = require("../middleware/rateLimitor");
const {submitCode,runCode} = require("../controllers/userSubmission");

// Rate limits for code submission and execution
const submissionLimiter = rateLimiter(10, 60); // 10 submissions per minute
const runLimiter = rateLimiter(20, 60); // 20 run requests per minute

// Submit code endpoint - runs against hidden test cases and stores in DB
submitRouter.post("/submit/:id", userMiddleware, submissionLimiter, submitCode);

// Run code endpoint - runs against visible test cases only, doesn't store in DB
submitRouter.post("/run/:id", userMiddleware, runLimiter, runCode);

module.exports = submitRouter;

