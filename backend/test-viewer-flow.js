#!/usr/bin/env node
/**
 * Test viewer accessing videos
 * Simulates a viewer logging in and fetching videos
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";
let authToken = null;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (authToken) {
      options.headers["Authorization"] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testViewerFlow() {
  console.log("\n🧪 TESTING VIEWER VIDEO ACCESS\n");

  try {
    // Step 1: Login as viewer
    console.log("1️⃣  Logging in as Viewer (john@gmail.com)...");
    const loginRes = await makeRequest("POST", "/api/auth/login", {
      email: "john@gmail.com",
      password: "john123456",
    });

    if (loginRes.status !== 200) {
      console.log(`   ❌ Login failed: ${loginRes.status}`);
      console.log(`   Response:`, loginRes.body);
      return;
    }

    authToken = loginRes.body.data.token;
    const user = loginRes.body.data.user;
    console.log(
      `   ✅ Logged in as: ${user.firstName} ${user.lastName} [${user.role}]`,
    );

    // Step 2: Fetch videos as viewer
    console.log("\n2️⃣  Fetching videos as Viewer...");
    const videosRes = await makeRequest("GET", "/api/videos");

    if (videosRes.status !== 200) {
      console.log(`   ❌ Failed to fetch videos: ${videosRes.status}`);
      console.log(`   Response:`, videosRes.body);
      return;
    }

    const videos = videosRes.body.data || [];
    console.log(`   ✅ Fetched ${videos.length} videos\n`);

    if (videos.length === 0) {
      console.log("   ⚠️  WARNING: Viewer sees NO videos!");
      console.log("   This means either:");
      console.log("   - No Admin users exist");
      console.log("   - No videos are uploaded by Admins");
      console.log("   - Query logic has an issue\n");
      return;
    }

    // Display videos
    console.log("   📺 Videos visible to Viewer:");
    videos.slice(0, 5).forEach((video, index) => {
      console.log(
        `      ${index + 1}. "${video.title}" (ID: ${video._id}, Status: ${video.status})`,
      );
    });

    if (videos.length > 5) {
      console.log(`      ... and ${videos.length - 5} more`);
    }

    // Step 3: Try to access a specific video
    if (videos.length > 0) {
      console.log(
        `\n3️⃣  Testing access to specific video: "${videos[0].title}"...`,
      );
      const videoRes = await makeRequest("GET", `/api/videos/${videos[0]._id}`);

      if (videoRes.status === 200) {
        console.log(
          `   ✅ Can access video details (Status: ${videoRes.body.data.status})`,
        );
      } else {
        console.log(
          `   ❌ Cannot access video: ${videoRes.status} - ${videoRes.body.message}`,
        );
      }
    }

    console.log("\n✅ TEST COMPLETE\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testViewerFlow();
