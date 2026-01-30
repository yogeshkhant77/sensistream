/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require("jsonwebtoken");
const config = require("../config/environment");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>

    if (!token) {
      console.log("❌ No token provided for:", req.method, req.path);
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user to request
    req.user = decoded;
    console.log("✅ Auth verified for user:", decoded.id, "Route:", req.path);
    next();
  } catch (error) {
    console.log("❌ Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
