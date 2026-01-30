#!/usr/bin/env node

// Test viewer visibility - simple HTTP test
const http = require("http");

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log("🧪 TESTING VIEWER VIDEO VISIBILITY\n");

  try {
    // 1. Login as Admin
    console.log("1️⃣  Logging in as ADMIN...");
    const adminLoginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "admin@example.com",
        password: "admin123456",
      },
    );

    if (adminLoginRes.status !== 200) {
      console.error("❌ Admin login failed:", adminLoginRes.body);
      return;
    }

    const adminToken = adminLoginRes.body.data?.token;
    const adminData = adminLoginRes.body.data?.user;
    console.log(
      `✅ Admin logged in: ${adminData?.firstName} (Role: ${adminData?.role})\n`,
    );

    // 2. Check admin videos
    console.log("2️⃣  Fetching ADMIN's videos...");
    const adminVideosRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/videos/my-videos",
      method: "GET",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const adminVideoCount = adminVideosRes.body.data?.length || 0;
    console.log(`   Found ${adminVideoCount} video(s) uploaded by admin`);
    if (adminVideoCount > 0) {
      adminVideosRes.body.data.slice(0, 2).forEach((v) => {
        console.log(`   - ${v.title}`);
      });
    }
    console.log();

    // 3. Login as Viewer
    console.log("3️⃣  Logging in as VIEWER...");
    const viewerLoginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "viewer@example.com",
        password: "viewer123456",
      },
    );

    if (viewerLoginRes.status !== 200) {
      console.error("❌ Viewer login failed:", viewerLoginRes.body);
      return;
    }

    const viewerToken = viewerLoginRes.body.data?.token;
    const viewerData = viewerLoginRes.body.data?.user;
    console.log(
      `✅ Viewer logged in: ${viewerData?.firstName} (Role: ${viewerData?.role})\n`,
    );

    // 4. Check viewer's visible videos
    console.log("4️⃣  Fetching videos VISIBLE to VIEWER...");
    const viewerVideosRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/videos/my-videos",
      method: "GET",
      headers: { Authorization: `Bearer ${viewerToken}` },
    });

    const viewerVideoCount = viewerVideosRes.body.data?.length || 0;
    console.log(`   Found ${viewerVideoCount} video(s) visible to viewer`);
    if (viewerVideoCount > 0) {
      viewerVideosRes.body.data.slice(0, 3).forEach((v) => {
        console.log(`   - ${v.title}`);
        console.log(
          `     Owner: ${v.owner?.firstName} (Role: ${v.owner?.role})`,
        );
      });
    } else {
      console.log("   ⚠️  NO VIDEOS VISIBLE TO VIEWER!\n");
    }

    // 5. Summary
    console.log("\n📊 SUMMARY:");
    console.log(`   Admin uploaded: ${adminVideoCount} videos`);
    console.log(`   Viewer can see: ${viewerVideoCount} videos`);

    if (adminVideoCount > 0 && viewerVideoCount === 0) {
      console.log("\n❌ BUG DETECTED: Viewer cannot see admin videos!");
    } else if (viewerVideoCount === adminVideoCount) {
      console.log("\n✅ SUCCESS: Viewer can see all admin videos!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();
