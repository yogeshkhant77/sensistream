#!/usr/bin/env node
/**
 * Create test viewer user
 */
const mongoose = require("mongoose");
const User = require("./models/User");

const dbUrl =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sensistream";

async function createTestViewer() {
  try {
    await mongoose.connect(dbUrl);

    // Check if test viewer already exists
    let viewer = await User.findOne({ email: "test-viewer@sensistream.com" });

    if (viewer) {
      console.log("\n✅ Test viewer already exists:");
      console.log(`   Email: ${viewer.email}`);
      console.log(`   Name: ${viewer.firstName} ${viewer.lastName}`);
      console.log(`   Role: ${viewer.role}`);
      console.log(`   Password: test-viewer-pass\n`);
    } else {
      // Create test viewer
      viewer = new User({
        firstName: "Test",
        lastName: "Viewer",
        email: "test-viewer@sensistream.com",
        password: "test-viewer-pass", // Will be hashed by pre-save hook
        role: "Viewer",
      });

      await viewer.save();

      console.log("\n✅ Test viewer created successfully:");
      console.log(`   Email: ${viewer.email}`);
      console.log(`   Name: ${viewer.firstName} ${viewer.lastName}`);
      console.log(`   Role: ${viewer.role}`);
      console.log(`   Password: test-viewer-pass\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

createTestViewer();
