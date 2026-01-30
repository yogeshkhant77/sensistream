/**
 * Video Stream Controller
 * Implements HTTP 206 Partial Content streaming for video files
 * Supports range requests for seeking, pause/resume, and multi-quality playback
 */

const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");

/**
 * Stream video with HTTP Range request support (206 Partial Content)
 *
 * ALGORITHM:
 * 1. Get video file path and size
 * 2. Check Range header from client
 * 3. If no range: return full file (200 OK)
 * 4. If range: calculate start/end bytes (206 Partial Content)
 * 5. Set proper headers (Content-Range, Accept-Ranges, Content-Length)
 * 6. Stream only requested bytes
 *
 * This allows:
 * - Seeking to any position without downloading entire file
 * - Pause/resume functionality
 * - Browser video player progress bar scrubbing
 * - Mobile bandwidth optimization
 */
exports.streamVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { quality = "720p", token } = req.query; // Default to 720p, allow 1080p, 480p

    console.log(`📺 Stream request: Video=${videoId}, Quality=${quality}`);

    // 1. Handle authentication: Check Authorization header OR token query parameter
    let userId, isAdmin, userRole;

    if (req.user) {
      // Token from Authorization header (authMiddleware)
      userId = req.user.id;
      userRole = req.user.role;
      isAdmin = req.user.role === "Admin";
      console.log("🔐 Auth via Authorization header");
    } else if (token) {
      // Token from query parameter (for HTML5 video src attribute)
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_jwt_secret",
        );
        userId = decoded.id;
        userRole = decoded.role;
        isAdmin = decoded.role === "Admin";
        console.log("🔐 Auth via query parameter token");
      } catch (err) {
        console.log("❌ Invalid token in query parameter:", err.message);
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token",
        });
      }
    } else {
      console.log("❌ No authentication provided");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Fetch video from database
    const video = await Video.findById(videoId).populate("owner");

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // 3. STRICT RBAC: Check if user can stream this video
    // - Admin: can stream any video
    // - Editor: can stream only own videos
    // - Viewer: can stream only admin-uploaded videos
    const isOwner = video.owner._id.toString() === userId;
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
      console.log(`🔒 Access denied for user ${userId} on video ${videoId}`);
      return res.status(403).json({
        success: false,
        message: "You don't have permission to stream this video",
      });
    }

    // 4. Check if video is still processing
    if (video.status === "Processing") {
      return res.status(202).json({
        success: false,
        message: "Video is still processing. Please wait.",
        progress: video.processingProgress,
      });
    }

    // 5. Determine file path based on quality
    const uploadsDir = path.join(__dirname, "../uploads");
    const videoDir = path.join(uploadsDir, videoId.toString());

    let videoPath;

    // Try to use compressed version first, fall back to original
    if (quality !== "original" && fs.existsSync(videoDir)) {
      const qualityFile = path.join(videoDir, `${quality}.mp4`);
      if (fs.existsSync(qualityFile)) {
        videoPath = qualityFile;
        console.log(`✓ Using ${quality} quality`);
      } else {
        // Fall back to original if quality not available
        videoPath = path.join(uploadsDir, video.filename);
        console.log(`⚠️  ${quality} not available, using original`);
      }
    } else {
      videoPath = path.join(uploadsDir, video.filename);
    }

    // 6. Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error(`❌ Video file not found: ${videoPath}`);
      return res.status(410).json({
        success: false,
        message: "Video file not found on storage",
      });
    }

    // 7. Get file size
    const fileSize = fs.statSync(videoPath).size;
    console.log(
      `📊 File size: ${(fileSize / 1024 / 1024).toFixed(2)}MB, Quality: ${quality}`,
    );

    // 8. Parse Range header
    const range = req.headers.range;

    if (range) {
      // HTTP 206 Partial Content Response
      return handleRangeRequest(videoPath, fileSize, range, res);
    } else {
      // HTTP 200 OK - Full file streaming
      return handleFullStreamRequest(videoPath, fileSize, res);
    }
  } catch (error) {
    console.error("❌ Stream error:", error);
    next(error);
  }
};

/**
 * Handle full file streaming (200 OK)
 * Used when client doesn't specify range or for initial request
 *
 * @private
 */
function handleFullStreamRequest(videoPath, fileSize, res) {
  console.log("📡 Streaming full video...");

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Length", fileSize);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-cache");

  const stream = fs.createReadStream(videoPath);
  stream.pipe(res);

  stream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).end();
  });
}

/**
 * Handle range request (206 Partial Content)
 * Parses Range header and streams only requested bytes
 *
 * Range header format: bytes=0-1023 (first 1KB)
 * Range header format: bytes=1024-2047 (second 1KB)
 * Range header format: bytes=0- (from byte 0 to end)
 *
 * @private
 */
function handleRangeRequest(videoPath, fileSize, range, res) {
  // Parse range header: "bytes=0-1023"
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Validate range
  if (start >= fileSize || start < 0 || end >= fileSize || start > end) {
    console.warn(
      `⚠️  Invalid range: start=${start}, end=${end}, fileSize=${fileSize}`,
    );

    res.setHeader("Content-Range", `bytes */${fileSize}`);
    return res.status(416).end(); // 416 Range Not Satisfiable
  }

  const chunksize = end - start + 1;

  console.log(
    `📦 Range request: bytes ${start}-${end}/${fileSize} (${(chunksize / 1024).toFixed(2)}KB)`,
  );

  // Set response headers for 206 Partial Content
  res.statusCode = 206;
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Length", chunksize);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Create read stream for this chunk
  const stream = fs.createReadStream(videoPath, { start, end });

  stream.on("error", (err) => {
    console.error("Stream chunk error:", err);
    res.status(500).end();
  });

  stream.pipe(res);
}

/**
 * Get available qualities for a video
 * Returns list of resolutions available for streaming
 */
exports.getAvailableQualities = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const uploadsDir = path.join(__dirname, "../uploads");
    const videoDir = path.join(uploadsDir, videoId.toString());

    const qualities = ["original"];

    // Check which quality files exist
    if (fs.existsSync(videoDir)) {
      if (fs.existsSync(path.join(videoDir, "1080p.mp4")))
        qualities.push("1080p");
      if (fs.existsSync(path.join(videoDir, "720p.mp4")))
        qualities.push("720p");
      if (fs.existsSync(path.join(videoDir, "480p.mp4")))
        qualities.push("480p");
    }

    res.json({
      success: true,
      data: {
        videoId,
        availableQualities: qualities,
        currentStatus: video.status,
      },
    });
  } catch (error) {
    console.error("Error fetching qualities:", error);
    next(error);
  }
};

/**
 * Get video metadata (duration, codec, bitrate)
 * Used for player initialization
 */
exports.getVideoMetadata = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    res.json({
      success: true,
      data: {
        videoId,
        title: video.title,
        description: video.description,
        duration: video.duration,
        status: video.status,
        thumbnail: video.thumbnail,
        sensitivityScore: video.sensitivityScore,
        flags: video.flags,
      },
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    next(error);
  }
};

module.exports = exports;
