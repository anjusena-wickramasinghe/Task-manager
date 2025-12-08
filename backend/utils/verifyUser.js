import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.access_token;

        if (!token) {
            return next(errorHandler(401, "Unauthorized: No token provided"));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: "...", role: "admin/user" }
        console.log("Decoded JWT:", req.user);

        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return next(errorHandler(401, "Unauthorized: Invalid token"));
    }
};

// Middleware for admin-only routes
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return next(errorHandler(401, "Unauthorized: No user info"));
    }

    if (req.user.role !== "admin") {
        return next(errorHandler(403, "Access denied, admin only!"));
    }

    next();
};
