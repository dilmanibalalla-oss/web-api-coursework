const express = require("express");

const {
  createReading,
  getReading,
  getInstallationReadings,
  getLastReading,
  getAllReadings
} = require("../controllers/reading.controller");

const asyncHandler = require("../utils/asyncHandler");

const {
  authenticate,
  requireRoles
} = require("../middleware/auth.middleware");

const etag = require("../middleware/etag.middleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  asyncHandler(getAllReadings)
);

router.get(
  "/:installationId",
  authenticate,
  asyncHandler(getInstallationReadings)
);

router.get(
  "/:installationId/last-reading",
  authenticate,
  etag,
  asyncHandler(getLastReading)
);

router.get(
  "/:installationId/:readingId",
  authenticate,
  asyncHandler(getReading)
);

router.post(
  "/:installationId",
  authenticate,
  requireRoles("DEVICE"),
  asyncHandler(createReading)
);

module.exports = router;