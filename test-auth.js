/**
 * Test Authentication Endpoints
 */

const http = require("http");

const API_URL = "http://localhost:5000/api";

// Test Health
function testHealth() {
  console.log("\n=== Testing Health Endpoint ===");
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/health",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:", JSON.parse(data));
      testRegister();
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error.message);
  });

  req.end();
}

// Test Register
function testRegister() {
  console.log("\n=== Testing Register Endpoint ===");
  const postData = JSON.stringify({
    firstName: "Test",
    lastName: "User",
    email: `testuser${Date.now()}@example.com`,
    password: "password123",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/register",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      try {
        console.log("Response:", JSON.parse(data));
      } catch (e) {
        console.log("Response (raw):", data);
      }
      testLogin();
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error.message);
  });

  req.write(postData);
  req.end();
}

// Test Login
function testLogin() {
  console.log("\n=== Testing Login Endpoint ===");
  const postData = JSON.stringify({
    email: "testuser@example.com",
    password: "password123",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      try {
        console.log("Response:", JSON.parse(data));
      } catch (e) {
        console.log("Response (raw):", data);
      }
      console.log("\n=== Tests Complete ===");
    });
  });

  req.on("error", (error) => {
    console.error("Error:", error.message);
  });

  req.write(postData);
  req.end();
}

// Start tests
testHealth();
