const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const routesGlob = path.join(__dirname, "routes/*.js").replace(/\\/g, "/");

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

  apis: [routesGlob],
};

module.exports = swaggerJSDoc(options);