/**
 * Role Check Middleware
 * Verifies user has required role(s)
 */

const roleCheckMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Convert single role to array
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    // Check if user role is in required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = roleCheckMiddleware;
