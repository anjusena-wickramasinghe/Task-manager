import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import user from "../models/user.model.js";

// SIGNUP
export const signup = async (req, res, next) => {
    const { name, email, password, profileImageUrl, adminJoinCode } = req.body;

    if (!name || !email || !password) {
        return next(errorHandler(400, "All fields are required"));
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(errorHandler(400, "User already exists"));
        }

        let role = "user";
        if (adminJoinCode && adminJoinCode === process.env.ADMIN_JOIN_CODE) {
            role = "admin";
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "Signup successful",
            user: newUser
        });

    } catch (error) {
        next(errorHandler(500, error.message));
    }
}

// SIGNIN
export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(errorHandler(400, "All fields are required"));
        }

        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, "User not found"));
        }

        const isPasswordValid = bcryptjs.compareSync(password, validUser.password);
        if (!isPasswordValid) {
            return next(errorHandler(400, "Wrong credentials"));
        }

        // Include role in JWT for admin checks
        const token = jwt.sign(
            { id: validUser._id, role: validUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const { password: pass, ...rest } = validUser._doc;

        res.status(200)
           .cookie("access_token", token, { httpOnly: true })
           .json(rest);

    } catch (error) {
        next(errorHandler(500, error.message));
    }
}
// USER PROFILE
export const userProfile = async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.user.id); // use id from JWT

        if (!foundUser) {
            return next(errorHandler(404, "User not found!"));
        }

        const { password, ...rest } = foundUser._doc;
        res.status(200).json(rest);

    } catch (error) {
        next(errorHandler(500, error.message));
    }
}
export const updateUserProfile = async (req,res,next)=>{
    try{
const user = await user.findById(req.user.id)

if (!User) {
            return next(errorHandler(404, "User not found"))
}

user.name = req.body.name || user.name
user.email = req.body.email || user.email

if(req.body.password){
    user.password = bcryptjs.hashSync(req.body.password,10)

}
const updatedUser = await user.save()

const {password:pass,...rest} =user._doc
res.status(200).json(rest)
    }catch(error){
        next(error)
    }
}