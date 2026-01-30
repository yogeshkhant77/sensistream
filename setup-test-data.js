#!/usr/bin/env node

// Create test users and videos
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

async function setupTestData() {
  console.log("🔧 Setting up test data...\n");

  try {
    // 1. Register or verify Admin user exists
    console.log("1️⃣  Checking/Creating ADMIN user...");
    const adminLoginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "admin@test.com",
        password: "admin123456",
      },
    );

    let adminToken;
    let adminId;

    if (adminLoginRes.status === 200) {
      console.log(`✅ Admin user exists`);
      adminToken = adminLoginRes.body.data?.token;
      adminId = adminLoginRes.body.data?.user?.id;
    } else {
      // Create admin user
      console.log(`   Creating new admin user...`);
      const registerRes = await makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/auth/register",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        {
          firstName: "Admin",
          lastName: "Test",
          email: "admin@test.com",
          password: "admin123456",
          role: "Admin",
        },
      );

      if (registerRes.status === 201) {
        console.log(`✅ Admin user created`);
        adminToken = registerRes.body.data?.token;
        adminId = registerRes.body.data?.user?.id;
      } else {
        console.error(`❌ Failed to create admin:`, registerRes.body);
        return;
      }
    }

    // 2. Check/Create Viewer user
    console.log("\n2️⃣  Checking/Creating VIEWER user...");
    const viewerLoginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        email: "viewer@test.com",
        password: "viewer123456",
      },
    );

    let viewerToken;
    let viewerId;

    if (viewerLoginRes.status === 200) {
      console.log(`✅ Viewer user exists`);
      viewerToken = viewerLoginRes.body.data?.token;
      viewerId = viewerLoginRes.body.data?.user?.id;
    } else {
      // Create viewer user
      console.log(`   Creating new viewer user...`);
      const registerRes = await makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/auth/register",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        {
          firstName: "Viewer",
          lastName: "Test",
          email: "viewer@test.com",
          password: "viewer123456",
          role: "Viewer",
        },
      );

      if (registerRes.status === 201) {
        console.log(`✅ Viewer user created`);
        viewerToken = registerRes.body.data?.token;
        viewerId = registerRes.body.data?.user?.id;
      } else {
        console.error(`❌ Failed to create viewer:`, registerRes.body);
        return;
      }
    }

    console.log(`\n📋 Test User IDs:`);
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Viewer ID: ${viewerId}`);

    console.log("\n✅ Test data setup complete!");
    console.log(`\nYou can now:`);
    console.log(
      `  - Login as Admin: admin-test@sensistream.local / admin123456`,
    );
    console.log(
      `  - Login as Viewer: viewer-test@sensistream.local / viewer123456`,
    );
    console.log(`\nTo test:`);
    console.log(`  1. Login as Admin and upload some videos`);
    console.log(`  2. Login as Viewer and check if those videos appear`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

setupTestData();
