const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

async function connectDatabase() {
  // Already connected
  if (
    cachedConnection &&
    mongoose.connection.readyState === 1
  ) {
    return cachedConnection;
  }

  // Connection is currently being established
  if (connectionPromise) {
    return connectionPromise;
  }

  // Check environment variable
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    })
    .then((connection) => {
      cachedConnection = connection;

      console.log("MongoDB connected");

      return connection;
    })
    .catch((error) => {
      // Allow another connection attempt after failure
      connectionPromise = null;
      cachedConnection = null;

      console.error(
        "MongoDB connection failed:",
        error.message
      );

      throw error;
    });

  return connectionPromise;
}

module.exports = connectDatabase;