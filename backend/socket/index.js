/**
 * Socket.io Configuration and Event Handlers
 * Handles real-time progress tracking and notifications
 * - Upload progress tracking
 * - Processing progress tracking (video encoding/analysis)
 * - Playback progress tracking
 * - Role-based notifications
 */

const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const Progress = require("../models/Progress");

const setupSocketIO = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.user = decoded;
      console.log(
        `🔌 Socket connected: User=${decoded.id}, Role=${decoded.role}`,
      );
      next();
    } catch (error) {
      console.log("❌ Socket auth error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection event
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userRole = socket.user.role;

    // Join user-specific room for targeted notifications
    socket.join(`user:${userId}`);
    console.log(`✅ User ${userId} joined room: user:${userId}`);

    /**
     * UPLOAD PROGRESS TRACKING
     * Real-time upload progress updates
     */

    socket.on("upload:start", async (data) => {
      const { videoId, fileName, fileSize } = data;
      console.log(
        `📤 Upload started: Video=${videoId}, Size=${fileSize} bytes`,
      );

      try {
        // Create/update progress record
        const progress = await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "uploadProgress.startedAt": new Date(),
              "uploadProgress.totalBytes": fileSize,
              "uploadProgress.bytesUploaded": 0,
              "uploadProgress.percentage": 0,
              "processingProgress.status": "Uploading",
            },
          },
          { upsert: true, new: true },
        );

        // Broadcast to user's room
        io.to(`user:${userId}`).emit("upload:start", {
          videoId,
          fileName,
          fileSize,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    });

    socket.on("upload:progress", async (data) => {
      const { videoId, bytesUploaded, totalBytes } = data;
      const percentage = (bytesUploaded / totalBytes) * 100;

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "uploadProgress.bytesUploaded": bytesUploaded,
              "uploadProgress.percentage": percentage,
            },
          },
        );

        // Broadcast to user's room
        io.to(`user:${userId}`).emit(`upload:progress:${videoId}`, {
          videoId,
          bytesUploaded,
          totalBytes,
          percentage: Math.round(percentage),
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating upload progress:", error);
      }
    });

    socket.on("upload:complete", async (data) => {
      const { videoId } = data;
      console.log(`✅ Upload completed: Video=${videoId}`);

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "uploadProgress.completedAt": new Date(),
              "uploadProgress.percentage": 100,
              "processingProgress.status": "Processing",
              "processingProgress.startedAt": new Date(),
            },
          },
        );

        // Broadcast to user's room
        io.to(`user:${userId}`).emit(`upload:complete:${videoId}`, {
          videoId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    });

    /**
     * VIDEO PROCESSING PROGRESS TRACKING
     * Receives progress updates from backend controllers
     * and broadcasts to subscribed clients
     */

    socket.on("video:processing:start", (data) => {
      console.log(`🎬 Video processing started: ${data.videoId}`);
      // Broadcast to user's room
      io.to(`user:${userId}`).emit("video:processing:start", {
        videoId: data.videoId,
        title: data.title,
        timestamp: new Date(),
      });
    });

    socket.on("video:processing:progress", async (data) => {
      const { videoId, progress, status, quality } = data;
      console.log(`📊 Video progress: ${videoId} - ${progress}%`);

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "processingProgress.percentage": progress,
              "processingProgress.status": status || "Processing",
              "processingProgress.currentQuality": quality,
            },
          },
        );
      } catch (error) {
        console.error("Error updating progress:", error);
      }

      // Broadcast to user's room
      io.to(`user:${userId}`).emit("video:processing:progress", {
        videoId,
        progress,
        status: status || "Processing",
        quality,
      });
    });

    socket.on("video:processing:complete", async (data) => {
      const { videoId, qualities, thumbnail } = data;
      console.log(`✅ Video processing complete: ${videoId}`);

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "processingProgress.percentage": 100,
              "processingProgress.status": "Complete",
              "processingProgress.completedAt": new Date(),
            },
          },
        );
      } catch (error) {
        console.error("Error updating progress:", error);
      }

      io.to(`user:${userId}`).emit("video:processing:complete", {
        videoId,
        status: "Complete",
        qualities,
        thumbnail,
      });
    });

    socket.on("video:processing:error", async (data) => {
      const { videoId, error } = data;
      console.log(`❌ Video processing error: ${videoId}`);

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "processingProgress.status": "Error",
              "processingProgress.error": error,
            },
          },
        );
      } catch (err) {
        console.error("Error updating progress:", err);
      }

      io.to(`user:${userId}`).emit("video:processing:error", {
        videoId,
        error,
      });
    });

    /**
     * PLAYBACK PROGRESS TRACKING
     * Track where user is in video playback
     */

    socket.on("video:playback:progress", async (data) => {
      const { videoId, currentTime, duration } = data;

      try {
        // Update progress record
        const percentage = (currentTime / duration) * 100;
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "playbackProgress.currentTime": currentTime,
              "playbackProgress.duration": duration,
              "playbackProgress.percentage": percentage,
              "playbackProgress.watchedDuration": currentTime,
            },
          },
          { upsert: true },
        );
      } catch (error) {
        console.error("Error updating playback progress:", error);
      }

      // Optionally broadcast to other devices of same user
      console.log(
        `▶️  Playback progress: Video=${videoId}, Time=${currentTime}/${duration}`,
      );
    });

    socket.on("video:playback:complete", async (data) => {
      const { videoId, duration } = data;
      console.log(`🎉 Video completed: ${videoId}`);

      try {
        // Update progress record
        await Progress.findOneAndUpdate(
          { videoId, userId },
          {
            $set: {
              "playbackProgress.isCompleted": true,
              "playbackProgress.completedAt": new Date(),
              "playbackProgress.currentTime": duration,
              "playbackProgress.percentage": 100,
            },
          },
        );
      } catch (error) {
        console.error("Error updating progress:", error);
      }

      io.to(`user:${userId}`).emit("video:playback:complete", {
        videoId,
        totalWatchTime: duration,
      });
    });

    /**
     * PROGRESS ROOM MANAGEMENT
     * Join/leave specific video progress rooms
     */

    socket.on("join-progress-room", (data) => {
      const { videoId } = data;
      socket.join(`progress:${videoId}`);
      console.log(
        `✅ User ${userId} joined progress room for video ${videoId}`,
      );
    });

    socket.on("leave-progress-room", (data) => {
      const { videoId } = data;
      socket.leave(`progress:${videoId}`);
      console.log(`👋 User ${userId} left progress room for video ${videoId}`);
    });

    /**
     * ROLE-BASED NOTIFICATIONS
     */

    // Admin notifications
    if (userRole === "Admin") {
      socket.join(`role:admin`);
      console.log(`👑 Admin ${userId} joined admin room`);

      socket.on("admin:stats:request", () => {
        io.to(`role:admin`).emit("admin:stats:update", {
          totalUsers: 0, // Would query database
          totalVideos: 0,
          totalStorage: 0,
          timestamp: new Date(),
        });
      });
    }

    // Editor notifications
    if (userRole === "Editor") {
      socket.join(`role:editor`);
    }

    // Viewer notifications
    if (userRole === "Viewer") {
      socket.join(`role:viewer`);
    }

    /**
     * DISCONNECT
     */

    socket.on("disconnect", () => {
      console.log(`🔌 User ${userId} disconnected`);
      socket.leave(`user:${userId}`);
    });

    /**
     * ERROR HANDLING
     */

    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

/**
 * Helper function to emit progress to specific user
 * Used from controllers
 */
const emitProgressToUser = (io, userId, eventName, data) => {
  io.to(`user:${userId}`).emit(eventName, data);
};

/**
 * Helper function to emit progress to all admins
 */
const emitToAdmins = (io, eventName, data) => {
  io.to(`role:admin`).emit(eventName, data);
};

/**
 * Helper function to broadcast to specific video progress room
 */
const broadcastToVideoRoom = (io, videoId, eventName, data) => {
  io.to(`progress:${videoId}`).emit(eventName, data);
};

module.exports = {
  setupSocketIO,
  emitProgressToUser,
  emitToAdmins,
  broadcastToVideoRoom,
};
