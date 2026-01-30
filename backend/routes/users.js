/**
 * User Management Routes (Admin Only)
 */

const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const roleCheckMiddleware = require("../middleware/roleCheck");

const router = express.Router();

// Protect all routes with auth and admin role check
router.use(authMiddleware);
router.use(roleCheckMiddleware("Admin"));

// Get all users
router.get("/", userController.getAllUsers);

// Get single user
router.get("/:userId", userController.getUser);

// Update user role
router.patch("/:userId/role", userController.updateUserRole);

// Update user status
router.patch("/:userId/status", userController.updateUserStatus);

// Delete user
router.delete("/:userId", userController.deleteUser);

module.exports = router;
