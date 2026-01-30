/**
 * Socket.io Service
 * Real-time communication for video processing updates
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinVideo = (videoId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("join-video", videoId);
  }
};

export const leaveVideo = (videoId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("leave-video", videoId);
  }
};

export const onProcessingUpdate = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on("processing-update", callback);
  }
};

export const onProcessingComplete = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on("processing-complete", callback);
  }
};

export const onProcessingError = (callback) => {
  const socket = getSocket();
  if (socket) {
    socket.on("processing-error", callback);
  }
};

export const offProcessingUpdate = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("processing-update");
  }
};

export const offProcessingComplete = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("processing-complete");
  }
};

export const offProcessingError = () => {
  const socket = getSocket();
  if (socket) {
    socket.off("processing-error");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
