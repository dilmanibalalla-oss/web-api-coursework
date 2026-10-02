const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

// Explicit requires to ensure Vercel Node File Trace (NFT) bundles route files into serverless lambdas
require("./routes/auth.routes");
require("./routes/district.routes");
require("./routes/substation.routes");
require("./routes/installation.routes");
require("./routes/reading.routes");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "Sri Lanka Solar Generation Data API",
      version: "1.0.0",
      description:
        "REST API for real-time and historical solar generation data."
    },

    servers: [
      {
        url: "/",
        description: "Current environment"
      },
      {
        url: "http://localhost:3000",
        description: "Local development (Port 3000)"
      },
      {
        url: "http://localhost:5000",
        description: "Local development (Port 5000)"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [
    path.join(__dirname, "routes/auth.routes.js").replace(/\\/g, "/"),
    path.join(__dirname, "routes/district.routes.js").replace(/\\/g, "/"),
    path.join(__dirname, "routes/substation.routes.js").replace(/\\/g, "/"),
    path.join(__dirname, "routes/installation.routes.js").replace(/\\/g, "/"),
    path.join(__dirname, "routes/reading.routes.js").replace(/\\/g, "/")
  ]
};

module.exports = swaggerJSDoc(options);
