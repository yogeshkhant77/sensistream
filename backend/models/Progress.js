/**
 * Progress Model
 * Tracks upload and playback progress for videos
 * Persists progress data to MongoDB for analytics and resume capabilities
 */

const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Upload progress tracking
    uploadProgress: {
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      bytesUploaded: { type: Number, default: 0 },
      totalBytes: { type: Number, default: 0 },
      startedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null },
    },
    // Playback progress tracking
    playbackProgress: {
      currentTime: { type: Number, default: 0 }, // In seconds
      duration: { type: Number, default: 0 }, // In seconds
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
      watchedDuration: { type: Number, default: 0 }, // Total seconds watched
    },
    // Processing progress tracking
    processingProgress: {
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      status: {
        type: String,
        enum: [
          "Pending",
          "Uploading",
          "Processing",
          "Encoding",
          "Complete",
          "Error",
        ],
        default: "Pending",
      },
      currentQuality: { type: String, default: null }, // e.g., "1080p", "720p"
      error: { type: String, default: null },
      startedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
progressSchema.index({ videoId: 1, userId: 1 }, { unique: true });
progressSchema.index({ videoId: 1 });
progressSchema.index({ userId: 1 });

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
