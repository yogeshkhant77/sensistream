/**
 * Video Controller
 * Handles video upload, retrieval, streaming, and deletion
 */

const Video = require("../models/Video");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Upload Video
exports.uploadVideo = async (req, res, next) => {
  try {
    console.log("📤 Upload initiated by user:", req.user?.id);
    console.log(
      "📁 File info:",
      req.file
        ? { name: req.file.originalname, size: req.file.size }
        : "No file",
    );
    console.log("📝 Body:", {
      title: req.body.title,
      description: req.body.description,
    });

    const { title, description } = req.body;

    if (!title) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Video title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Create video document
    const video = new Video({
      title,
      description: description || null,
      owner: req.user.id,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      status: "Processing",
      processingProgress: 10,
    });

    await video.save();

    // Emit processing event via Socket.io
    if (req.io) {
      req.io.to(`user:${req.user.id}`).emit("video:processing:start", {
        videoId: video._id.toString(),
        title: video.title,
        status: "Processing",
      });
    }

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        ...video.toObject(),
        fileUrl: `/api/uploads/${req.file.filename}`,
      },
    });

    // Simulate async video processing
    processVideoAsync(video._id, req.file.path, req.io, req.user.id);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Simulate async video processing
const processVideoAsync = async (videoId, filePath, io, userId) => {
  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return;
    }

    // Simulate processing stages
    const stages = [
      { progress: 30, status: "Analyzing", quality: "1080p" },
      { progress: 50, status: "Extracting metadata", quality: "1080p" },
      { progress: 70, status: "Running analysis", quality: "720p" },
      { progress: 90, status: "Finalizing", quality: "720p" },
    ];

    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      video.processingProgress = stage.progress;
      await video.save();

      // Emit progress via Socket.io
      if (io) {
        io.to(`user:${userId}`).emit("video:processing:progress", {
          videoId: videoId.toString(),
          progress: stage.progress,
          status: stage.status,
          quality: stage.quality,
        });
      }
    }

    // Simulate sensitivity detection (keyword-based or random)
    const sensitivityScore = Math.floor(Math.random() * 100);
    const isFlagged = sensitivityScore > 50;

    // Simulated keyword detection
    const flaggedKeywords = [];
    if (Math.random() > 0.7) {
      flaggedKeywords.push("Potentially sensitive content detected");
    }

    video.status = isFlagged ? "Flagged" : "Safe";
    video.sensitivityScore = sensitivityScore;
    video.flags = flaggedKeywords;
    video.processingProgress = 100;
    video.duration = 120; // Simulated duration

    await video.save();

    // Emit completion event
    if (io) {
      io.to(`user:${userId}`).emit("video:processing:complete", {
        videoId: videoId.toString(),
        status: video.status,
        sensitivityScore: video.sensitivityScore,
        flags: flaggedKeywords,
      });
    }
  } catch (error) {
    console.error("Error processing video:", error);

    const video = await Video.findById(videoId);
    if (video) {
      video.status = "Processing";
      video.processingError = error.message;
      await video.save();

      io.to(`video-${videoId}`).emit("processing-error", {
        videoId: videoId.toString(),
        error: error.message,
      });
    }
  }
};

// Get All Videos for User
// STRICT VISIBILITY RULE:
// - Admin: sees ALL videos
// - Editor: sees ONLY their own videos
// - Viewer: sees ONLY admin-uploaded videos
exports.getUserVideos = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`🔍 getUserVideos called - User: ${userId}, Role: ${userRole}`);

    let query;

    if (userRole === "Admin") {
      // Admins see all videos
      query = {};
      console.log(`👤 Admin user - fetching ALL videos`);
    } else if (userRole === "Editor") {
      // Editors see ONLY their own videos
      query = { owner: userId };
      console.log(`✏️ Editor user - fetching OWN videos only`);
    } else if (userRole === "Viewer") {
      // Viewers see ONLY admin-uploaded videos
      // Find all admin users first
      const User = require("../models/User");
      const adminUsers = await User.find({ role: "Admin" }).lean();
      console.log(`👀 Viewer user - Found ${adminUsers.length} admin users`);

      if (adminUsers.length === 0) {
        console.log(`⚠️  WARNING: No admin users found in database!`);
      }

      const adminIds = adminUsers.map((u) => u._id);
      console.log(
        `📺 Admin IDs:`,
        adminIds.map((id) => id.toString()),
      );

      query = {
        owner: { $in: adminIds }, // Only admin-uploaded videos
      };
      console.log(`🎬 Query for viewer:`, JSON.stringify(query, null, 2));
    }

    // Filter by status
    if (status && ["Processing", "Safe", "Flagged"].includes(status)) {
      query.status = status;
      console.log(`🔎 Status filter applied: ${status}`);
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
      console.log(`🔎 Search filter applied: ${search}`);
    }

    console.log(`📋 Final MongoDB query:`, JSON.stringify(query));

    const videos = await Video.find(query)
      .populate("owner", "firstName lastName role")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${videos.length} videos for user role: ${userRole}`);
    if (videos.length > 0) {
      videos.slice(0, 3).forEach((v) => {
        console.log(`   - ${v.title} (owner role: ${v.owner?.role})`);
      });
    }

    // Add file URLs to videos
    const videosWithUrls = videos.map((video) => ({
      ...video.toObject(),
      fileUrl: `/api/uploads/${video.filename}`,
    }));

    res.json({
      success: true,
      data: videosWithUrls,
    });
  } catch (error) {
    console.error(`❌ Error in getUserVideos:`, error.message);
    console.error(`📍 Stack:`, error.stack);
    next(error);
  }
};

// Get Single Video with STRICT Access Control
// STRICT VISIBILITY RULE:
// - Admin: can view ANY video
// - Editor: can view ONLY their own videos
// - Viewer: can view ONLY admin-uploaded videos
exports.getVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(
      `🎬 getVideo called - VideoID: ${videoId}, User: ${userId}, Role: ${userRole}`,
    );

    const video = await Video.findById(videoId).populate(
      "owner",
      "firstName lastName role",
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // STRICT ACCESS CONTROL
    const isOwner = video.owner._id.toString() === userId;
    const isAdmin = userRole === "Admin";
    const isAdminUploadedVideo = video.owner.role === "Admin";

    let hasAccess = false;

    if (isAdmin) {
      hasAccess = true; // Admins can view all
      console.log(`✅ Admin access granted`);
    } else if (userRole === "Editor") {
      hasAccess = isOwner; // Editors can view only own videos
      console.log(`✅ Editor access - isOwner: ${isOwner}`);
    } else if (userRole === "Viewer") {
      hasAccess = isAdminUploadedVideo; // Viewers can view only admin videos
      console.log(
        `✅ Viewer access - isAdminUploadedVideo: ${isAdminUploadedVideo}`,
      );
    }

    if (!hasAccess) {
      console.log(`❌ Access DENIED`);
      return res.status(403).json({
        success: false,
        message: "You do not have access to this video",
      });
    }

    res.json({
      success: true,
      data: {
        ...video.toObject(),
        fileUrl: `/api/uploads/${video.filename}`,
      },
    });
  } catch (error) {
    console.error(`❌ Error in getVideo:`, error.message);
    next(error);
  }
};

// Stream Video with STRICT Access Control
// STRICT VISIBILITY RULE:
// - Admin: can stream ANY video
// - Editor: can stream ONLY their own videos
// - Viewer: can stream ONLY admin-uploaded videos
exports.streamVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const video = await Video.findById(videoId).populate(
      "owner",
      "firstName lastName role",
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // STRICT ACCESS CONTROL
    const isOwner = video.owner._id.toString() === userId;
    const isAdmin = userRole === "Admin";
    const isAdminUploadedVideo = video.owner.role === "Admin";

    let hasAccess = false;

    if (isAdmin) {
      hasAccess = true; // Admins can stream all
    } else if (userRole === "Editor") {
      hasAccess = isOwner; // Editors can stream only own videos
    } else if (userRole === "Viewer") {
      hasAccess = isAdminUploadedVideo; // Viewers can stream only admin videos
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this video",
      });
    }

    if (video.status === "Processing") {
      return res.status(400).json({
        success: false,
        message: "Video is still being processed",
      });
    }

    const filePath = path.join(process.cwd(), video.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Video file not found",
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests for streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res
          .status(416)
          .send(
            "Requested Range Not Satisfiable\n" + start + " >= " + fileSize,
          );
        return;
      }

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", end - start + 1);
      res.setHeader("Content-Type", video.mimeType);

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Type", video.mimeType);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
};

// Delete Video
exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check ownership or admin status
    if (video.owner.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this video",
      });
    }

    // Delete video file
    const filePath = path.join(process.cwd(), video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete video document
    await Video.findByIdAndDelete(videoId);

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's video counts
    const totalVideos = await Video.countDocuments({ owner: userId });
    const safeVideos = await Video.countDocuments({
      owner: userId,
      status: "Safe",
    });
    const flaggedVideos = await Video.countDocuments({
      owner: userId,
      status: "Flagged",
    });

    res.json({
      success: true,
      data: {
        totalVideos,
        safeVideos,
        flaggedVideos,
      },
    });
  } catch (error) {
    next(error);
  }
};
