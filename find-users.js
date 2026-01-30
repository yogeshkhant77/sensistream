#!/usr/bin/env node

// Find existing test users
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
  console.log("🔍 Finding existing test users...\n");

  const testAccounts = [
    { email: "test@example.com", password: "test123456" },
    { email: "admin@example.com", password: "admin123456" },
    { email: "viewer@example.com", password: "viewer123456" },
    { email: "editor@example.com", password: "editor123456" },
    { email: "testuser@example.com", password: "test123456" },
  ];

  for (const account of testAccounts) {
    try {
      const res = await makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/auth/login",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        account,
      );

      if (res.status === 200) {
        const user = res.body.data?.user;
        console.log(`✅ ${account.email}`);
        console.log(`   Name: ${user?.firstName} ${user?.lastName}`);
        console.log(`   Role: ${user?.role}`);
        console.log(`   ID: ${user?.id}\n`);
      }
    } catch (error) {
      // Silently skip
    }
  }
}

test();
