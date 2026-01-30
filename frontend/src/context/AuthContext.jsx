/**
 * Auth Context
 * Global state management for authentication
 * Initializes Socket.io connection on login
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { initializeSocket, disconnectSocket } from "../socket/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      // Initialize Socket.io with saved token
      initializeSocket(savedToken).catch((error) => {
        console.error("Failed to initialize socket:", error);
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Initialize Socket.io connection after login
      try {
        await initializeSocket(token);
        console.log("✅ Socket.io initialized for user:", user.id);
      } catch (socketError) {
        console.error("⚠️  Failed to initialize socket:", socketError);
        // Continue even if socket fails
      }

      return { success: true, user, token };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const register = async (
    firstName,
    lastName,
    email,
    password,
    organization = null,
  ) => {
    try {
      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
        organization,
      });

      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Initialize Socket.io connection after registration
      try {
        await initializeSocket(token);
        console.log("✅ Socket.io initialized for user:", user.id);
      } catch (socketError) {
        console.error("⚠️  Failed to initialize socket:", socketError);
        // Continue even if socket fails
      }

      return { success: true, user, token };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Disconnect socket.io
    disconnectSocket();

    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
