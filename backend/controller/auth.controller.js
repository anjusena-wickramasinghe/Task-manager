import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"

export const signup = async (req, res) => {
    const { name, email, password, profileImageUrl, adminJoinCode } = req.body;

    // Validation
    if (!name || !email || !password || name === "" || email === "" || password === "") {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check existing user
        const isAlreadyExist = await User.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
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
            password: hashedPassword,   // FIXED
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
        console.error(error);
        res.status(500).json({
            message: error.message   // FIXED
        });
    }
};
