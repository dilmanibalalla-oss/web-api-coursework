const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

const authRoutes = require("./routes/auth.routes");
const districtRoutes = require("./routes/district.routes");
const substationRoutes = require("./routes/substation.routes");
const installationRoutes = require("./routes/installation.routes");
const readingRoutes = require("./routes/reading.routes");

const {
  notFoundHandler,
  errorHandler
} = require("./middlewares/error.middleware");

const app = express();

// Disable CSP so Swagger UI inline scripts & CDN assets aren't blocked by Helmet
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Raw Swagger JSON spec endpoint
app.get("/api-docs/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

// Cloudflare CDN assets for Swagger UI (solves Vercel serverless missing node_modules static files)
const SWAGGER_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css";
const SWAGGER_JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js"
];

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: SWAGGER_CSS_URL,
    customJs: SWAGGER_JS_URLS
  })
);

app.get("/", (_req, res) => {
  res.json({ message: "Solar Generation API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/substations", substationRoutes);
app.use("/api/installations", installationRoutes);
app.use("/api/readings", readingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
