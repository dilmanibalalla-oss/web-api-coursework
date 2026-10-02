const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

// CDN URLs for Swagger UI assets (bypasses local static file serverless issues on Vercel)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css";
const JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"
];

function setupSwagger(app) {
  // Raw Swagger JSON endpoint
  app.get("/api-docs/swagger.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });

  // Swagger UI with CDN asset options
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCssUrl: CSS_URL,
      customJs: JS_URLS
    })
  );
}

module.exports = setupSwagger;