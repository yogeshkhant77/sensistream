/**
 * Authentication Routes
 */

const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user (protected)
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
