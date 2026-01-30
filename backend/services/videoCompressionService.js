/**
 * Video Compression Service
 * Handles FFmpeg-based video encoding for multiple resolutions
 * Generates 1080p, 720p, and 480p versions for CDN-ready streaming
 */

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);

// Configure FFmpeg (assumes ffmpeg is installed system-wide)
const FFmpegPath = require("ffmpeg-static");
ffmpeg.setFfmpegPath(FFmpegPath);

/**
 * Quality profiles for multi-resolution streaming
 */
const QUALITY_PROFILES = {
  "1080p": {
    name: "1080p",
    resolution: "1920x1080",
    bitrate: "5000k",
    videoCodec: "libx264",
    audioCodec: "aac",
    audioRate: "128k",
  },
  "720p": {
    name: "720p",
    resolution: "1280x720",
    bitrate: "2500k",
    videoCodec: "libx264",
    audioCodec: "aac",
    audioRate: "96k",
  },
  "480p": {
    name: "480p",
    resolution: "854x480",
    bitrate: "1200k",
    videoCodec: "libx264",
    audioCodec: "aac",
    audioRate: "64k",
  },
};

/**
 * Convert video to multiple resolutions
 * @param {string} inputPath - Path to original video file
 * @param {string} outputDir - Directory to save compressed versions
 * @param {function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Paths to compressed videos by quality
 */
exports.compressVideoMultiQuality = async (
  inputPath,
  outputDir,
  videoId,
  onProgress = () => {},
) => {
  try {
    console.log("🎬 Starting video compression for multiple qualities...");

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Get video metadata first
    const duration = await getVideoDuration(inputPath);
    console.log(`⏱️  Video duration: ${duration}s`);

    const compressionResults = {};
    let overallProgress = 0;

    // Compress for each quality
    for (const [qualityKey, profile] of Object.entries(QUALITY_PROFILES)) {
      const outputFile = path.join(outputDir, `${qualityKey}.mp4`);

      console.log(`📹 Compressing to ${qualityKey}...`);

      // Update progress callback
      onProgress({
        quality: qualityKey,
        progress: 0,
        message: `Starting ${qualityKey} compression`,
      });

      await compressToQuality(
        inputPath,
        outputFile,
        profile,
        duration,
        (progress) => {
          onProgress({
            quality: qualityKey,
            progress: Math.round(progress),
            message: `Compressing to ${qualityKey}`,
          });
        },
      );

      compressionResults[qualityKey] = {
        path: outputFile,
        filename: `${qualityKey}.mp4`,
        size: (await stat(outputFile)).size,
        quality: qualityKey,
        bitrate: profile.bitrate,
      };

      console.log(`✅ ${qualityKey} compression complete`);
      overallProgress += 33;
      onProgress({
        overall: Math.min(overallProgress, 99),
        message: "Compression in progress...",
      });
    }

    onProgress({
      overall: 100,
      message: "All quality compressions complete!",
    });

    return compressionResults;
  } catch (error) {
    console.error("❌ Video compression error:", error);
    throw new Error(`Failed to compress video: ${error.message}`);
  }
};

/**
 * Compress video to specific quality using FFmpeg
 * @private
 */
function compressToQuality(
  inputFile,
  outputFile,
  profile,
  duration,
  onProgress,
) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .videoCodec(profile.videoCodec)
      .audioCodec(profile.audioCodec)
      .audioBitrate(profile.audioRate)
      .videoBitrate(profile.bitrate)
      .size(profile.resolution)
      .autopad()
      .format("mp4")
      .output(outputFile)
      .on("progress", (progress) => {
        // FFmpeg timemark is like "00:01:23.45"
        const timeParts = progress.timemark.split(":");
        const seconds =
          parseInt(timeParts[0]) * 3600 +
          parseInt(timeParts[1]) * 60 +
          parseFloat(timeParts[2]);
        const percent = (seconds / duration) * 100;
        onProgress(Math.min(percent, 99.9));
      })
      .on("end", () => {
        console.log(`✓ ${profile.name} compression finished`);
        resolve();
      })
      .on("error", reject)
      .run();
  });
}

/**
 * Get video duration in seconds
 * @private
 */
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration || 0;
        resolve(Math.round(duration));
      }
    });
  });
}

/**
 * Extract thumbnail from video
 * @param {string} inputPath - Path to video file
 * @param {string} outputDir - Directory to save thumbnail
 * @returns {Promise<string>} - Path to thumbnail
 */
exports.extractThumbnail = async (inputPath, outputDir, filename) => {
  try {
    await mkdir(outputDir, { recursive: true });
    const thumbnailPath = path.join(
      outputDir,
      `${path.parse(filename).name}-thumb.jpg`,
    );

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .on("filenames", (filenames) => {
          console.log(`📸 Will extract thumbnail: ${filenames}`);
        })
        .on("end", () => {
          console.log("✅ Thumbnail extracted");
          resolve(thumbnailPath);
        })
        .on("error", reject)
        .screenshots({
          timestamps: ["50%"],
          filename: path.basename(thumbnailPath),
          folder: outputDir,
          size: "320x240",
        });
    });
  } catch (error) {
    console.error("❌ Thumbnail extraction error:", error);
    return null;
  }
};

/**
 * Get video metadata (duration, codec, bitrate, etc)
 * @param {string} filePath - Path to video file
 * @returns {Promise<Object>} - Video metadata
 */
exports.getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const { format, streams } = metadata;
        const videoStream = streams.find((s) => s.codec_type === "video") || {};

        resolve({
          duration: Math.round(format.duration || 0),
          bitrate: format.bit_rate,
          filesize: format.size,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          codec: videoStream.codec_name || "unknown",
          fps: videoStream.r_frame_rate || "unknown",
        });
      }
    });
  });
};

module.exports = exports;
