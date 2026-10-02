require("dotenv").config();

const mongoose = require("mongoose");
const app = require("../app");
const connectDatabase = require("../config/database");

let databasePromise;

function connectOnce() {
  if (!databasePromise || mongoose.connection.readyState !== 1) {
    databasePromise = connectDatabase();
  }

  return databasePromise;
}

async function handler(req, res) {
  if (process.env.MONGODB_URI) {
    try {
      await connectOnce();
    } catch (err) {
      console.error("Database connection error in handler:", err.message);
    }
  }
  return app(req, res);
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;

  connectOnce()
    .then(() => {
      app.listen(port, () => {
        console.log(`Solar Generation API listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start API:", error.message);
      process.exitCode = 1;
    });
}

module.exports = handler;