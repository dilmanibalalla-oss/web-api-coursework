const express = require("express");

const {
  getInstallation,
  createInstallation,
  updateInstallation,
  deleteInstallation,
  getInstallationDetails
} = require("../controllers/installation.controller");

const asyncHandler = require("../utils/asyncHandler");

const {
  authenticate,
  requireRoles
} = require("../middleware/auth.middleware");

const etag = require("../middleware/etag.middleware");

const router = express.Router();

router.get(
  "/:id",
  etag,
  asyncHandler(getInstallation)
);

router.get(
  "/:id/details",
  asyncHandler(getInstallationDetails)
);

router.post(
  "/",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(createInstallation)
);

router.put(
  "/:id",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(updateInstallation)
);

router.delete(
  "/:id",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(deleteInstallation)
);

module.exports = router;