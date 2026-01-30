// Direct MongoDB check - requires MongoDB running
const mongoose = require("mongoose");

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/sensistream");
    console.log("✅ Connected to MongoDB\n");

    // Get collections
    const User = require("./backend/models/User");
    const Video = require("./backend/models/Video");

    // Check users
    const allUsers = await User.find().lean();
    console.log("📋 ALL USERS IN DATABASE:");
    console.log(`   Total: ${allUsers.length}`);
    allUsers.forEach((u) => {
      console.log(
        `   - ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`,
      );
    });
    console.log();

    // Check admin users specifically
    const adminUsers = await User.find({ role: "Admin" }).lean();
    console.log("👤 ADMIN USERS:");
    console.log(`   Count: ${adminUsers.length}`);
    const adminIds = adminUsers.map((u) => u._id);
    console.log(
      `   Admin IDs: ${adminIds.map((id) => id.toString()).join(", ")}`,
    );
    console.log();

    // Check videos
    const allVideos = await Video.find()
      .populate("owner", "firstName lastName role email")
      .lean();
    console.log("🎬 ALL VIDEOS IN DATABASE:");
    console.log(`   Total: ${allVideos.length}`);
    allVideos.forEach((v) => {
      console.log(`   - Title: ${v.title}`);
      console.log(
        `     Owner: ${v.owner?.firstName} ${v.owner?.lastName} (${v.owner?.email})`,
      );
      console.log(`     Owner Role: ${v.owner?.role}`);
      console.log(`     Owner ID: ${v.owner?._id}`);
      console.log();
    });

    // Check videos by admin
    const adminVideos = await Video.find({ owner: { $in: adminIds } })
      .populate("owner", "firstName lastName role")
      .lean();
    console.log("📺 VIDEOS BY ADMIN:");
    console.log(`   Count: ${adminVideos.length}`);
    adminVideos.forEach((v) => {
      console.log(
        `   - ${v.title} (owner: ${v.owner?.firstName} ${v.owner?.lastName})`,
      );
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
