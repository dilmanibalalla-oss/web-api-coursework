const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

function setupSwagger(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
}

module.exports = setupSwagger;