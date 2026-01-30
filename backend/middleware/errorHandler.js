/**
 * Global Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */

const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error values
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";
  let data = null;

  // Handle multer errors
  if (err.code === "LIMIT_FILE_SIZE" || err.code === "FILE_TOO_LARGE") {
    status = 400;
    message = "File is too large. Maximum size is 500MB";
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
    data = Object.values(err.errors).map((error) => error.message);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    status = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  // Handle token expiration
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Send response
  res.status(status).json({
    success: false,
    message,
    ...(data && { data }),
  });
};

module.exports = errorHandlerMiddleware;
