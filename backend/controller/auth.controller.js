import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken"


export const signup = async (req, res, next) => {
    const { name, email, password, profileImageUrl, adminJoinCode } = req.body;

    // Validation
    if (!name || !email || !password) {
        return next(errorHandler(400, "All fields are required"));
    }

    try {
        // Check existing user
        const isAlreadyExist = await User.findOne({ email });
        if (isAlreadyExist) {
            return next(errorHandler(400, "User already exists"));
        }

        // Check admin role
        let role = "user";
        if (adminJoinCode && adminJoinCode === process.env.ADMIN_JOIN_CODE) {
            role = "admin";
        }

        // Hash password
        const hashedPassword = bcryptjs.hashSync(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "Signup successful",
            user: newUser
        });

    } catch (error) {
        return next(errorHandler(500, error.message));
    }
}

export const signin = async (req,res,next)=>{
    try{
const{email,password}=req.body

if(!email ||!password || email==="" ||password===""){
    return next(errorHandler(400,"All fields are required"))
}

const ValidUser=await User.findOne({email})

if(!ValidUser){
    return next(errorHandler(404,"User not found"))
}

//compare password
const validPassword = bcryptjs.compareSync(password,ValidUser.password)
if(!validPassword){
    return next(errorHandler(400,"Wrong credentials"))
}

const token = jwt.sign({id:ValidUser._id},process.env.JWT_SECRET)

const{password:pass,...rest} = ValidUser._doc

res.status(200).cookie("access_token",token,{httpOnly:true}).json(rest)
    }catch(error){
        next(error)
    }
}
