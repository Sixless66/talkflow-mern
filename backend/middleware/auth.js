import User from "../models/userModel.js";
import jwt from 'jsonwebtoken'

// Middleware to protect routes

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.json({success : false, message : "User not found"});

        req.user = user;
        next();
    } catch (error) {
        console.log("protect route");
        res.json({success : false, message : error.message});
    }
} 