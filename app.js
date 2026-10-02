const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const setupSwagger = require("./swagger-ui"); 

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

// Disable CSP so Swagger UI CDN assets load properly
// app.js
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Mount Swagger endpoints
setupSwagger(app);

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