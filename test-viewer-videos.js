// Test script to verify viewer can see admin videos
const fetch = require("node-fetch");

async function testViewerVideos() {
  try {
    console.log("🧪 Testing Viewer Video Visibility...\n");

    // 1. Find or create test users
    const adminEmail = "admin@example.com";
    const viewerEmail = "viewer@example.com";
    const adminPassword = "admin123456";
    const viewerPassword = "viewer123456";

    // 2. Login as Admin
    console.log("1️⃣  Logging in as ADMIN...");
    const adminLoginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.data?.token) {
      console.error("❌ Admin login failed:", adminLoginData);
      return;
    }

    const adminToken = adminLoginData.data.token;
    const adminUser = adminLoginData.data.user;
    console.log(
      `✅ Admin logged in: ${adminUser.firstName} ${adminUser.lastName}`,
    );
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}\n`);

    // 3. Fetch admin's videos
    console.log("2️⃣  Fetching ADMIN videos...");
    const adminVideosRes = await fetch(
      "http://localhost:5000/api/videos/my-videos",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );

    const adminVideosData = await adminVideosRes.json();
    console.log(
      `   Found ${adminVideosData.data?.length || 0} video(s) uploaded by admin`,
    );
    if (adminVideosData.data?.length > 0) {
      adminVideosData.data.slice(0, 3).forEach((v) => {
        console.log(`   - ${v.title} (ID: ${v._id})`);
      });
    }
    console.log();

    // 4. Login as Viewer
    console.log("3️⃣  Logging in as VIEWER...");
    const viewerLoginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: viewerEmail,
        password: viewerPassword,
      }),
    });

    const viewerLoginData = await viewerLoginRes.json();
    if (!viewerLoginData.data?.token) {
      console.error("❌ Viewer login failed:", viewerLoginData);
      return;
    }

    const viewerToken = viewerLoginData.data.token;
    const viewerUser = viewerLoginData.data.user;
    console.log(
      `✅ Viewer logged in: ${viewerUser.firstName} ${viewerUser.lastName}`,
    );
    console.log(`   Role: ${viewerUser.role}`);
    console.log(`   ID: ${viewerUser.id}\n`);

    // 5. Fetch viewer's videos (should see admin videos only)
    console.log("4️⃣  Fetching videos VISIBLE to VIEWER...");
    const viewerVideosRes = await fetch(
      "http://localhost:5000/api/videos/my-videos",
      {
        headers: { Authorization: `Bearer ${viewerToken}` },
      },
    );

    const viewerVideosData = await viewerVideosRes.json();
    console.log(
      `   Found ${viewerVideosData.data?.length || 0} video(s) visible to viewer`,
    );
    if (viewerVideosData.data?.length > 0) {
      viewerVideosData.data.slice(0, 5).forEach((v) => {
        console.log(`   - ${v.title}`);
        console.log(
          `     Owner: ${v.owner?.firstName} ${v.owner?.lastName} (Role: ${v.owner?.role})`,
        );
        console.log(`     ID: ${v._id}\n`);
      });
    } else {
      console.log("   ⚠️  NO VIDEOS VISIBLE TO VIEWER!\n");
    }

    // 6. Check debug endpoint
    console.log("5️⃣  Checking DEBUG endpoint for admin videos...");
    const debugRes = await fetch(
      "http://localhost:5000/api/videos/debug/admin-videos",
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );

    const debugData = await debugRes.json();
    console.log(
      `   Admin users found: ${debugData.data?.adminUsersCount || 0}`,
    );
    console.log(
      `   Admin user IDs: ${debugData.data?.adminUserIds?.join(", ") || "none"}`,
    );
    console.log(
      `   Total videos in DB: ${debugData.data?.allVideosCount || 0}`,
    );
    console.log(`   Videos by admin: ${debugData.data?.adminVideosCount || 0}`);
    console.log(
      `   Admin users: ${debugData.data?.adminUsers?.map((u) => `${u.name} (${u._id})`).join(", ") || "none"}`,
    );

    if (debugData.data?.adminVideos?.length > 0) {
      console.log(`\n   Videos uploaded by admins:`);
      debugData.data.adminVideos.forEach((v) => {
        console.log(`   - ${v.title} by ${v.ownerName} (${v.owner})`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testViewerVideos();
