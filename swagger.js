const swaggerJSDoc = require("swagger-jsdoc");

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
        url: "http://localhost:5000",
        description: "Local development"
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

  apis: []
};

module.exports = swaggerJSDoc(options);