
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const routesGlob = path
  .join(__dirname, "routes", "*.js")
  .replace(/\\/g, "/");

const isProduction = process.env.VERCEL === "1";

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
        url: isProduction
          ? "https://web-api-coursework.vercel.app"
          : "http://localhost:3000",
        description: isProduction
          ? "Production server (Vercel)"
          : "Local development server"
      },
      {
        url: "http://localhost:5000",
        description: "Alternative local development server"
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

  apis: [routesGlob]
};

module.exports = swaggerJSDoc(options);
