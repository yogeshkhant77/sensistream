/**
 * SensiStream Backend Server
 * Main entry point with Express and Socket.io setup
 */

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server: SocketIOServer } = require("socket.io");
const path = require("path");
const config = require("./config/environment");
const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const userRoutes = require("./routes/users");

// Import middleware
const errorHandlerMiddleware = require("./middleware/errorHandler");

// Import Socket.io setup
const { setupSocketIO } = require("./socket/index");

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Configure Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ["GET", "POST"],
  },
});

// Setup Socket.io event handlers and middleware
setupSocketIO(io);

// Make io accessible to controllers
app.locals.io = io;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  }),
);

// Make io accessible to all routes via middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve uploaded files statically (both paths for compatibility)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SensiStream server is running",
    timestamp: new Date(),
  });
});

// Test upload endpoint
app.post("/api/test-upload", (req, res) => {
  console.log("✅ Test upload endpoint hit!");
  res.json({ success: true, message: "Test endpoint working" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandlerMiddleware);

// Start server
const PORT = config.port;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`✅ SensiStream server running on port ${PORT}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🎥 Video uploads directory: ${config.upload.uploadDir}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

module.exports = { app, io };
