const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const userMiddleware = async (req,res,next)=>{
    try{
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not persent");

        const payload = jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if(!result){
            throw new Error("User Doesn't Exist");
        }

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;
        next();
    }
    catch(err){
        if (process.env.NODE_ENV === 'development') {
            console.error('User middleware error:', err.message);
        }
        res.status(401).json({
            error: "Authentication failed",
            message: err.message
        });
    }
}

module.exports = userMiddleware;