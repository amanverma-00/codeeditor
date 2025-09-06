const express = require('express');

const authRouter =  express.Router();
const {register, login,logout, adminRegister,deleteProfile} = require('../controllers/userAuthent')
const {getUserProfile, updateUserProfile, getUserStreak} = require('../controllers/userProfile')
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware ,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);

authRouter.get('/profile', userMiddleware, getUserProfile);
authRouter.put('/profile', userMiddleware, updateUserProfile);
authRouter.get('/streak', userMiddleware, getUserStreak);

authRouter.get('/check',userMiddleware,(req,res)=>{

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid User"
    });
})

module.exports = authRouter;