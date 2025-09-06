const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")

const register = async (req,res)=>{
    
    try{

      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = 'user'

      req.body.problemSolved = [];

     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
    }
    
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).json({
        user:reply,
        message:"Registration Successfully"
    })
    }
    catch(err){
        console.error('Registration error:', err);

        if (err.code === 11000) {
            
            if (err.keyValue && err.keyValue.emailId) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            if (err.message && err.message.includes('problemSolved_1')) {
                return res.status(500).json({
                    message: "Database configuration error. Please contact administrator to fix database indexes.",
                    error: "problemSolved_index_error",
                    suggestion: "This is a database index issue that needs to be resolved by dropping the problemSolved_1 index from the users collection."
                });
            }
            
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        if (err.message) {
            return res.status(400).json({
                message: err.message
            });
        }
        
        res.status(400).json({
            message: "Registration failed"
        });
    }
}

const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        if(!user){
            throw new Error("Invalid Credentials");
        }

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        console.error('Login error:', err);
        res.status(401).json({
            message: err.message || "Login failed"
        });
    }
}

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

    res.cookie("token",null,{expires: new Date(Date.now())});
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}

const adminRegister = async(req,res)=>{
    try{

      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);

     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,{maxAge: 60*60*1000});
     res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;

    await User.findByIdAndDelete(userId);

    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {register, login,logout,adminRegister,deleteProfile};