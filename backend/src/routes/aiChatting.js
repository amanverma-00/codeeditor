const express = require('express');
const aiRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { solveDoubt, testGroq } = require('../controllers/solveDoubt');

aiRouter.get('/status', (req, res) => {
    res.json({ 
        status: 'AI routes working', 
        timestamp: new Date().toISOString(),
        groqKeyPresent: !!process.env.GROQ_KEY
    });
});

aiRouter.post('/chat', userMiddleware, solveDoubt);
aiRouter.get('/test', testGroq); 

module.exports = aiRouter;