/**
 * Video Model
 * Schema for storing video metadata, processing status, and sensitivity data
 */

const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // In bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // In seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ["Processing", "Safe", "Flagged"],
      default: "Processing",
    },
    sensitivityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    flags: {
      type: [String],
      default: [],
    },
    processingProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    processingError: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String, // Path to thumbnail
      default: null,
    },
    qualities: {
      "1080p": {
        filename: String,
        size: Number, // In bytes
        bitrate: String,
        path: String,
      },
      "720p": {
        filename: String,
        size: Number,
        bitrate: String,
        path: String,
      },
      "480p": {
        filename: String,
        size: Number,
        bitrate: String,
        path: String,
      },
    },
    compressionStatus: {
      type: String,
      enum: ["Pending", "Compressing", "Complete", "Failed"],
      default: "Pending",
    },
    compressionError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
videoSchema.index({ owner: 1, status: 1 });
videoSchema.index({ title: "text" });

module.exports = mongoose.model("Video", videoSchema);
