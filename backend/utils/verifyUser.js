import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            return next(errorHandler(401, "Unauthorized: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
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
