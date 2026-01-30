/**
 * Environment Configuration
 * Loads and validates environment variables
 */

require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/sensistream",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_production",
    expire: process.env.JWT_EXPIRE || "7d",
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000, // 500MB
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

module.exports = config;
