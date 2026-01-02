const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

    try{
        console.log('[AdminMiddleware] Checking admin access');
        console.log('[AdminMiddleware] Cookies:', req.cookies);
        console.log('[AdminMiddleware] Headers:', req.headers.cookie);
       
        const {token} = req.cookies;
        if(!token) {
            console.log('[AdminMiddleware] ❌ No token found in cookies');
            throw new Error("Token is not present");
        }

        console.log('[AdminMiddleware] ✓ Token found');
        const payload = jwt.verify(token,process.env.JWT_KEY);
        console.log('[AdminMiddleware] Payload:', { _id: payload._id, role: payload.role, emailId: payload.emailId });

        const {_id} = payload;

        if(!_id){
            console.log('[AdminMiddleware] ❌ No _id in token');
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        if(payload.role!='admin') {
            console.log('[AdminMiddleware] ❌ User role is not admin:', payload.role);
            throw new Error("Invalid Token - Not an admin");
        }

        console.log('[AdminMiddleware] ✓ User is admin');

        if(!result){
            console.log('[AdminMiddleware] ❌ User not found in database');
            throw new Error("User Doesn't Exist");
        }

        // Redis ke blockList mein persent toh nahi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked) {
            console.log('[AdminMiddleware] ❌ Token is blocked');
            throw new Error("Invalid Token - Token blocked");
        }

        console.log('[AdminMiddleware] ✅ Admin access granted');
        req.result = result;


        next();
    }
    catch(err){
        console.log('[AdminMiddleware] Error:', err.message);
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
