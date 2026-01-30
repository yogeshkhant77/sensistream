/**
 * Storage Service
 * Abstracts video storage for easy CDN integration
 * Supports local storage and AWS S3/CloudFront with signed URLs
 *
 * ARCHITECTURE PATTERN:
 * - Local Development: Files stored in ./uploads/
 * - Production with CDN: Files stored on S3, served via CloudFront signed URLs
 * - This service handles both transparently
 */

const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

const USE_S3 = process.env.USE_S3 === "true";
const S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

// Initialize S3 if enabled
let s3Client = null;
let cloudFront = null;

if (USE_S3) {
  s3Client = new AWS.S3({
    region: AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  cloudFront = new AWS.CloudFront.Signer({
    keyPairId: process.env.CLOUDFRONT_KEYPAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
  });
}

/**
 * Upload file to storage (local or S3)
 * Returns storage key for later retrieval
 */
exports.uploadFile = async (localPath, storageKey) => {
  try {
    if (USE_S3 && s3Client) {
      // Upload to S3
      const fileContent = fs.readFileSync(localPath);
      const params = {
        Bucket: S3_BUCKET,
        Key: storageKey,
        Body: fileContent,
        ContentType: "video/mp4",
        ACL: "private", // Private - access via signed URLs only
      };

      const result = await s3Client.upload(params).promise();
      console.log(`✅ Uploaded to S3: ${storageKey}`);
      return { success: true, location: result.Location, key: storageKey };
    } else {
      // Store locally (development)
      console.log(`💾 Storing locally: ${localPath}`);
      return { success: true, location: localPath, key: storageKey };
    }
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }
};

/**
 * Get streaming URL for video
 *
 * LOCAL: Returns /api/videos/{id}/stream?quality=720p
 * S3+CDN: Returns CloudFront signed URL with expiration
 *
 * Benefits of CDN:
 * - Content cached at edge locations globally
 * - Reduced bandwidth from origin server
 * - Better streaming performance for users worldwide
 * - Automatic failover and redundancy
 */
exports.getStreamUrl = (videoId, quality = "720p", expirationMinutes = 60) => {
  if (USE_S3 && cloudFront && CLOUDFRONT_DOMAIN) {
    // Generate CloudFront signed URL
    // URL expires in specified minutes (default 1 hour)
    const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;

    const url = `https://${CLOUDFRONT_DOMAIN}/videos/${videoId}/${quality}.mp4`;

    try {
      const signedUrl = cloudFront.getSignedUrl({
        url,
        expires: expiration,
      });

      console.log(`🌐 CloudFront signed URL for ${videoId}`);
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      // Fallback to local streaming
      return `/api/videos/${videoId}/stream?quality=${quality}`;
    }
  } else {
    // Local streaming via Node.js backend
    return `/api/videos/${videoId}/stream?quality=${quality}`;
  }
};

/**
 * Get file from storage
 * Returns stream for local or signed URL for S3
 */
exports.getFileStream = async (storageKey) => {
  try {
    if (USE_S3 && s3Client) {
      // Get stream from S3
      const params = {
        Bucket: S3_BUCKET,
        Key: storageKey,
      };
      return s3Client.getObject(params).createReadStream();
    } else {
      // Get stream from local storage
      return fs.createReadStream(storageKey);
    }
  } catch (error) {
    console.error("❌ Get file error:", error);
    throw error;
  }
};

/**
 * Delete file from storage
 */
exports.deleteFile = async (storageKey) => {
  try {
    if (USE_S3 && s3Client) {
      // Delete from S3
      await s3Client
        .deleteObject({
          Bucket: S3_BUCKET,
          Key: storageKey,
        })
        .promise();
      console.log(`🗑️  Deleted from S3: ${storageKey}`);
    } else {
      // Delete locally
      if (fs.existsSync(storageKey)) {
        fs.unlinkSync(storageKey);
        console.log(`🗑️  Deleted locally: ${storageKey}`);
      }
    }
  } catch (error) {
    console.error("❌ Delete error:", error);
    throw error;
  }
};

/**
 * Check if CDN is enabled
 */
exports.isCdnEnabled = () => USE_S3 && s3Client;

/**
 * Get storage info for debugging
 */
exports.getStorageInfo = () => ({
  cdnEnabled: USE_S3,
  bucket: S3_BUCKET || "N/A",
  region: AWS_REGION,
  cloudFrontDomain: CLOUDFRONT_DOMAIN || "N/A",
  provider: USE_S3 ? "AWS S3 + CloudFront" : "Local Storage",
});

module.exports = exports;
