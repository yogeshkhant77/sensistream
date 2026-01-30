/**
 * Socket.io Client Setup
 * Manages real-time connection and event subscriptions
 */

import io from "socket.io-client";

let socket = null;

/**
 * Initialize Socket.io connection
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Socket>}
 */
export const initializeSocket = (token) => {
  return new Promise((resolve, reject) => {
    try {
      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      // Create new socket connection
      socket = io("http://localhost:5000", {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Connection successful
      socket.on("connect", () => {
        console.log("✅ Socket.io connected:", socket.id);
        resolve(socket);
      });

      // Connection error
      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        reject(error);
      });

      // Disconnection
      socket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
      });

      // Reconnection attempts
      socket.on("reconnect_attempt", () => {
        console.log("🔄 Reconnecting...");
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get current socket instance
 * @returns {Socket}
 */
export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn("⚠️  Socket not connected");
  }
  return socket;
};

/**
 * Subscribe to video processing progress
 * @param {function} callback - Called with progress data
 * @returns {function} Unsubscribe function
 */
export const subscribeToProcessingProgress = (callback) => {
  if (!socket) return () => {};

  // Subscribe to all progress events
  const handleStart = (data) => callback({ type: "start", data });
  const handleProgress = (data) => callback({ type: "progress", data });
  const handleComplete = (data) => callback({ type: "complete", data });
  const handleError = (data) => callback({ type: "error", data });

  socket.on("video:processing:start", handleStart);
  socket.on("video:processing:progress", handleProgress);
  socket.on("video:processing:complete", handleComplete);
  socket.on("video:processing:error", handleError);

  // Return unsubscribe function
  return () => {
    socket.off("video:processing:start", handleStart);
    socket.off("video:processing:progress", handleProgress);
    socket.off("video:processing:complete", handleComplete);
    socket.off("video:processing:error", handleError);
  };
};

/**
 * Subscribe to playback completion
 * @param {function} callback
 * @returns {function} Unsubscribe function
 */
export const subscribeToPlaybackComplete = (callback) => {
  if (!socket) return () => {};

  socket.on("video:playback:complete", callback);
  return () => socket.off("video:playback:complete", callback);
};

/**
 * Emit playback progress to backend
 * @param {string} videoId
 * @param {number} currentTime
 * @param {number} duration
 */
export const emitPlaybackProgress = (videoId, currentTime, duration) => {
  if (!socket || !socket.connected) return;

  socket.emit("video:playback:progress", {
    videoId,
    currentTime,
    duration,
    timestamp: new Date(),
  });
};

/**
 * Emit video completion
 * @param {string} videoId
 * @param {number} duration
 */
export const emitVideoComplete = (videoId, duration) => {
  if (!socket || !socket.connected) return;

  socket.emit("video:playback:complete", {
    videoId,
    duration,
    completedAt: new Date(),
  });
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};

export default {
  initializeSocket,
  getSocket,
  subscribeToProcessingProgress,
  subscribeToPlaybackComplete,
  emitPlaybackProgress,
  emitVideoComplete,
  disconnectSocket,
};
