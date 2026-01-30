#!/usr/bin/env node
/**
 * List all users with their IDs (passwords are hashed)
 */
const mongoose = require("mongoose");
const User = require("./models/User");

const dbUrl =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sensistream";

async function listUsers() {
  try {
    await mongoose.connect(dbUrl);
    const users = await User.find().select("_id email firstName lastName role");

    console.log("\n👥 USERS IN DATABASE:\n");
    users.forEach((user) => {
      console.log(`ID: ${user._id}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log("");
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listUsers();
