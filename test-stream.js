// Test script to verify video streaming works
const fetch = require("node-fetch");

async function testVideoStreaming() {
  try {
    console.log("🧪 Testing Video Streaming...\n");

    // 1. Login
    console.log("1️⃣  Logging in...");
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "test123456",
      }),
    });

    const loginData = await loginRes.json();
    if (!loginData.data?.token) {
      console.error("❌ Login failed:", loginData);
      return;
    }

    const token = loginData.data.token;
    console.log(`✅ Logged in! Token: ${token.substring(0, 20)}...\n`);

    // 2. Get my videos
    console.log("2️⃣  Fetching videos...");
    const videosRes = await fetch(
      "http://localhost:5000/api/videos/my-videos",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const videosData = await videosRes.json();
    if (!videosData.data?.length) {
      console.error("❌ No videos found");
      return;
    }

    const video = videosData.data[0];
    console.log(`✅ Found ${videosData.data.length} video(s)`);
    console.log(`   ID: ${video._id}`);
    console.log(`   Title: ${video.title}`);
    console.log(`   Status: ${video.status}`);
    console.log(`   Filename: ${video.filename}\n`);

    // 3. Get qualities
    console.log(`3️⃣  Getting available qualities...`);
    const qualitiesRes = await fetch(
      `http://localhost:5000/api/videos/${video._id}/qualities`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const qualitiesData = await qualitiesRes.json();
    console.log(
      `✅ Available qualities: ${qualitiesData.data.availableQualities.join(", ")}\n`,
    );

    // 4. Test streaming endpoint with token in query param
    console.log(`4️⃣  Testing stream endpoint with token...`);
    const streamUrl = `http://localhost:5000/api/videos/${video._id}/stream?quality=original&token=${token}`;
    const streamRes = await fetch(streamUrl);

    console.log(`Stream response status: ${streamRes.status}`);
    if (streamRes.ok) {
      const buffer = await streamRes.buffer();
      console.log(
        `✅ Stream received! Size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB\n`,
      );
    } else {
      const error = await streamRes.text();
      console.error(`❌ Stream failed:`, error);
    }

    console.log("✨ Test complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testVideoStreaming();
