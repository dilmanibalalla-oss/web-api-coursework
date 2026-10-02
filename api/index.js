require("dotenv").config();

const mongoose = require("mongoose");
const app = require("../app");
const connectDatabase = require("../config/database");

async function handler(req, res) {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not configured");

    return res.status(500).json({
      success: false,
      message: "Database configuration is missing"
    });
  }

  try {
    // Connect to MongoDB
    await connectDatabase();
  } catch (err) {
    console.error(
      "Database connection error:",
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }

  // Pass request to Express
  return app(req, res);
}


// Local development
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  connectDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(
          `Solar Generation API listening on port ${port}`
        );
      });
    })
    .catch((error) => {
      console.error(
        "Failed to start API:",
        error.message
      );

      process.exitCode = 1;
    });
}

module.exports = handler;