/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces strict role-based access at backend level
 */

const Video = require("../models/Video");

/**
 * ROLE HIERARCHY
 * Admin > Editor > Viewer
 * Admin has all permissions
 * Editors can upload, edit their own videos, and access content
 * Viewers can only view content
 */

const ROLE_PERMISSIONS = {
  Admin: {
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canManageUsers: true,
    canViewAnalytics: true,
  },
  Editor: {
    canUpload: true,
    canEdit: true, // Own videos only
    canDelete: true, // Own videos only
    canView: true,
    canManageUsers: false,
    canViewAnalytics: false,
  },
  Viewer: {
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canManageUsers: false,
    canViewAnalytics: false,
  },
};

/**
 * Check if user has required role
 * Supports single role or array of roles
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        console.log("❌ RBAC: No user in request");
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Normalize roles to array
      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      const userRole = req.user.role;

      // Check if user has required role
      if (!roles.includes(userRole)) {
        console.log(
          `🔒 RBAC DENIED: User ${req.user.id} (${userRole}) tried to access ${req.method} ${req.path}`,
        );
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${userRole}`,
        });
      }

      console.log(
        `✅ RBAC ALLOWED: User ${req.user.id} (${userRole}) accessing ${req.method} ${req.path}`,
      );
      next();
    } catch (error) {
      console.error("❌ RBAC error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during authorization check",
      });
    }
  };
};

/**
 * Check if user owns a resource
 * Used to verify ownership before allowing edit/delete
 */
const requireOwnership = (resourceGetter) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Get resource owner ID
      const ownerId = await resourceGetter(req);

      // Check if user is owner or admin
      const isOwner = ownerId.toString() === req.user.id;
      const isAdmin = req.user.role === "Admin";

      if (!isOwner && !isAdmin) {
        console.log(
          `🔒 OWNERSHIP DENIED: User ${req.user.id} tried to access resource owned by ${ownerId}`,
        );
        return res.status(403).json({
          success: false,
          message: "You do not have permission to modify this resource",
        });
      }

      console.log(
        `✅ OWNERSHIP ALLOWED: User ${req.user.id} accessing resource`,
      );
      next();
    } catch (error) {
      console.error("❌ Ownership check error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during ownership check",
      });
    }
  };
};

/**
 * RBAC Rules Definition
 * Maps endpoints to required roles
 */
const RBAC_RULES = {
  // Viewer - can only watch videos
  Viewer: {
    canWatch: true,
    canUpload: false,
    canDelete: false,
    canManageUsers: false,
  },

  // Editor - can upload and manage own videos
  Editor: {
    canWatch: true,
    canUpload: true,
    canDelete: true, // Own videos only
    canManageUsers: false,
  },

  // Admin - full access
  Admin: {
    canWatch: true,
    canUpload: true,
    canDelete: true, // Any video
    canManageUsers: true,
  },
};

/**
 * Check specific permission
 */
const hasPermission = (userRole, permission) => {
  const roleRules = RBAC_RULES[userRole];
  if (!roleRules) return false;
  return roleRules[permission] === true;
};

module.exports = {
  requireRole,
  requireOwnership,
  hasPermission,
  RBAC_RULES,
};
