const express = require('express');

const authRouter =  express.Router();
const {register, login, logout, adminRegister, deleteProfile, verifyOTP, resendOTP} = require('../controllers/userAuthent')
const {getUserProfile, updateUserProfile, getUserStreak} = require('../controllers/userProfile');
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');

// Public Routes - No authentication required
// Register & OTP Verification
authRouter.post('/register', register);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);
authRouter.post('/login', login);

// Protected Routes - Require authentication
authRouter.post('/logout', userMiddleware, logout);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/profile', userMiddleware, getUserProfile);
authRouter.put('/profile', userMiddleware, updateUserProfile);
authRouter.get('/streak', userMiddleware, getUserStreak);

// User verification endpoint
authRouter.get('/check', userMiddleware, (req,res)=>{
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        isVerified: req.result.isVerified,
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

// Admin Routes - Require admin authentication
authRouter.post('/admin/register', adminMiddleware, adminRegister);

module.exports = authRouter;

