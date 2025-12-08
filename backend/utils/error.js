// utils/error.js

// Function to create an error
export const errorHandler = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode || 500;
    return error;
};

// Express error-handling middleware
export const handleErrors = (err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(status).json({
        success: false,
        status,
        message,
    });
};
