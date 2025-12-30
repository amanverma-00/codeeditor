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

        // Check if Redis is connected before using it
        if(redisClient.isOpen) {
            const IsBlocked = await redisClient.exists(`token:${token}`);
            if(IsBlocked)
                throw new Error("Invalid Token");
        }
        // If Redis is not connected, skip token blacklist check and continue

        req.result = result;
        next();
    }
    catch(err){
        return res.status(401).json({ success: false, error: err.message });
    }
}

module.exports = userMiddleware;
