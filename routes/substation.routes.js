const express = require("express");

const {
  getSubstations,
  getSubstation,
  getSubstationInstallations
} = require("../controllers/substation.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getSubstations));

router.get("/:id", asyncHandler(getSubstation));

router.get(
  "/:id/installations",
  asyncHandler(getSubstationInstallations)
);

module.exports = router;