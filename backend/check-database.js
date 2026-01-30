#!/usr/bin/env node
/**
 * Simple database check script
 */
const mongoose = require("mongoose");
const User = require("./models/User");
const Video = require("./models/Video");

const dbUrl =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sensistream";

async function checkDatabase() {
  try {
    console.log(`\n📊 Connecting to: ${dbUrl}\n`);
    await mongoose.connect(dbUrl);

    // Check users
    console.log("👥 USERS IN DATABASE:");
    const users = await User.find().select("_id email firstName lastName role");
    console.log(`   Total users: ${users.length}\n`);

    if (users.length === 0) {
      console.log("   ⚠️  No users found!\n");
    } else {
      users.forEach((user) => {
        console.log(
          `   - ${user.firstName} ${user.lastName} (${user.email}) [${user.role}]`,
        );
      });
    }

    // Check admins specifically
    console.log("\n👤 ADMIN USERS:");
    const admins = await User.find({ role: "Admin" }).select(
      "_id email firstName lastName role",
    );
    console.log(`   Total admins: ${admins.length}\n`);

    if (admins.length === 0) {
      console.log("   ⚠️  NO ADMIN USERS FOUND! Viewers will see no videos.\n");
    } else {
      admins.forEach((admin) => {
        console.log(
          `   - ${admin.firstName} ${admin.lastName} (${admin.email})`,
        );
      });
    }

    // Check videos
    console.log("\n🎬 VIDEOS IN DATABASE:");
    const videos = await Video.find()
      .populate("owner", "firstName lastName role email")
      .select("_id title owner status");
    console.log(`   Total videos: ${videos.length}\n`);

    if (videos.length === 0) {
      console.log("   ⚠️  No videos found!\n");
    } else {
      videos.forEach((video) => {
        console.log(
          `   - "${video.title}" (Owner: ${video.owner?.firstName} ${video.owner?.lastName}, Role: ${video.owner?.role}, Status: ${video.status})`,
        );
      });
    }

    // Check admin videos specifically
    console.log("\n📺 VIDEOS UPLOADED BY ADMINS (what viewers should see):");
    const adminVideoList = videos.filter((v) => v.owner?.role === "Admin");
    console.log(`   Total admin videos: ${adminVideoList.length}\n`);

    if (adminVideoList.length === 0) {
      console.log("   ⚠️  NO ADMIN VIDEOS FOUND! Viewers will see nothing.\n");
    } else {
      adminVideoList.forEach((video) => {
        console.log(`   - "${video.title}" (${video.owner?.email})`);
      });
    }

    // Summary
    console.log("\n📋 SUMMARY:");
    console.log(`   ✅ Total Users: ${users.length}`);
    console.log(`   ✅ Total Admins: ${admins.length}`);
    console.log(`   ✅ Total Videos: ${videos.length}`);
    console.log(`   ✅ Videos by Admins: ${adminVideoList.length}`);

    if (admins.length > 0 && adminVideoList.length > 0) {
      console.log("\n✅ DATABASE LOOKS GOOD - Feature should work!\n");
    } else {
      console.log("\n⚠️  DATABASE NEEDS TEST DATA:");
      if (admins.length === 0) {
        console.log("   - Need to create at least one Admin user");
      }
      if (adminVideoList.length === 0) {
        console.log("   - Need Admin to upload at least one video");
      }
      console.log("\n");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
