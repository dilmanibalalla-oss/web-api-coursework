const mongoose = require("mongoose");

let cachedConnection = null;

async function connectDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  console.log("MongoDB connected");

  return cachedConnection;
}

module.exports = connectDatabase;