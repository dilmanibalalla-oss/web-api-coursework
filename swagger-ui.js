const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

// Use CDN-hosted Swagger UI assets to avoid Vercel serverless truncation
// of large static files from swagger-ui-dist
const SWAGGER_UI_VERSION = "5.11.0";
const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/${SWAGGER_UI_VERSION}`;

function setupSwagger(app) {
  // Raw Swagger JSON endpoint (always works fine)
  app.get("/api-docs/swagger.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });

  // Serve a fully CDN-based Swagger UI HTML page.
  // We bypass swaggerUi.serve (which serves local static files) and instead
  // return a custom HTML page that loads all assets from CDN. This prevents
  // Vercel's serverless functions from truncating the large JS/CSS bundles.
  app.get("/api-docs", (_req, res) => {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sri Lanka Solar Generation Data API</title>
    <link rel="stylesheet" href="${CDN_BASE}/swagger-ui.min.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${CDN_BASE}/swagger-ui-bundle.js"></script>
    <script src="${CDN_BASE}/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: "/api-docs/swagger.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
          deepLinking: true,
          displayRequestDuration: true,
          tryItOutEnabled: true
        });
      };
    </script>
  </body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  // Also handle trailing slash redirect
  app.get("/api-docs/", (_req, res) => res.redirect("/api-docs"));
}

module.exports = setupSwagger;
