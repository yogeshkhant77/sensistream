/**
 * ProtectedRoute Component
 * Guards routes based on authentication and role (RBAC)
 * Enforces access control at frontend level
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    console.warn("❌ Access denied: Not authenticated");
    return <Navigate to="/login" replace />;
  }

  // Check role-based access (RBAC)
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!rolesArray.includes(user.role)) {
      console.warn(
        `❌ Access denied: User role '${user.role}' not in allowed roles: ${rolesArray.join(", ")}`,
      );

      // Show access denied message
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f5f5f5",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
              🔒 Access Denied
            </h1>
            <p
              style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}
            >
              You don't have permission to access this page.
            </p>
            <p
              style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}
            >
              Required role: {rolesArray.join(" or ")}
              <br />
              Your role: {user.role}
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Go Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed - render protected content
  console.log(`✅ Access granted for user: ${user.id}, Role: ${user.role}`);
  return children;
};

export default ProtectedRoute;
