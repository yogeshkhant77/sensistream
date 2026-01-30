/**
 * Video Routes with STRICT Role-Based Access Control (RBAC)
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const videoController = require("../controllers/videoController");
const videoStreamController = require("../controllers/videoStreamController");
const authMiddleware = require("../middleware/auth");
const { requireRole, requireOwnership } = require("../middleware/rbac");

const router = express.Router();

// Log all requests to this router
router.use((req, res, next) => {
  console.log(`📹 Video route: ${req.method} ${req.path}`);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "video-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "video/mp4",
    "video/x-matroska",
    "video/x-msvideo",
    "video/quicktime",
    "video/webm",
  ];
  const allowedExt = [".mp4", ".mkv", ".avi", ".mov", ".webm"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only MP4, MKV, AVI, MOV, WEBM allowed"),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 524288000, // 500MB
  },
});

// Protected routes (require authentication)
// Upload video - ONLY Editors and Admins can upload
router.post(
  "/upload",
  authMiddleware,
  requireRole(["Editor", "Admin"]), // STRICT RBAC
  (req, res, next) => {
    upload.single("video")(req, res, (err) => {
      if (err) {
        // Handle multer errors
        if (err.code === "FILE_TOO_LARGE") {
          return res.status(400).json({
            success: false,
            message: "File is too large. Maximum size is 500MB",
          });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File is too large. Maximum size is 500MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  videoController.uploadVideo,
);

// Get user videos - ALL authenticated users
router.get("/my-videos", authMiddleware, videoController.getUserVideos);

// Stream video (HTTP 206 Range request support)
// NOTE: No authMiddleware here - auth handled inside controller via token query param or Authorization header
router.get("/:videoId/stream", videoStreamController.streamVideo);

// Get available quality options - ALL authenticated users
router.get(
  "/:videoId/qualities",
  authMiddleware,
  videoStreamController.getAvailableQualities,
);

// Get video metadata - ALL authenticated users
router.get(
  "/:videoId/metadata",
  authMiddleware,
  videoStreamController.getVideoMetadata,
);

// Get single video - ALL authenticated users
router.get("/:videoId", authMiddleware, videoController.getVideo);

// Delete video - ONLY owner or Admin can delete
router.delete(
  "/:videoId",
  authMiddleware,
  requireOwnership(async (req) => {
    // Get video owner ID from database
    const Video = require("../models/Video");
    const video = await Video.findById(req.params.videoId);
    if (!video) throw new Error("Video not found");
    return video.owner;
  }),
  videoController.deleteVideo,
);

// Get dashboard stats - ALL authenticated users
router.get(
  "/dashboard/stats",
  authMiddleware,
  videoController.getDashboardStats,
);

// DEBUG ENDPOINT - Check all videos and admin users
router.get("/debug/admin-videos", authMiddleware, async (req, res, next) => {
  try {
    const User = require("../models/User");
    const Video = require("../models/Video");

    const adminUsers = await User.find({ role: "Admin" });
    const adminIds = adminUsers.map((u) => u._id);
    const allVideos = await Video.find().populate(
      "owner",
      "firstName lastName role",
    );
    const adminVideos = await Video.find({ owner: { $in: adminIds } }).populate(
      "owner",
      "firstName lastName role",
    );

    res.json({
      success: true,
      data: {
        adminUsersCount: adminUsers.length,
        adminUserIds: adminIds.map((id) => id.toString()),
        allVideosCount: allVideos.length,
        adminVideosCount: adminVideos.length,
        adminUsers: adminUsers.map((u) => ({
          _id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
        })),
        allVideos: allVideos.map((v) => ({
          _id: v._id,
          title: v.title,
          owner: v.owner?._id,
          ownerRole: v.owner?.role,
          ownerName: `${v.owner?.firstName} ${v.owner?.lastName}`,
        })),
        adminVideos: adminVideos.map((v) => ({
          _id: v._id,
          title: v.title,
          owner: v.owner?._id,
          ownerName: `${v.owner?.firstName} ${v.owner?.lastName}`,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
