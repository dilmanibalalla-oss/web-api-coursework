const express = require("express");

const {
  getDistricts,
  getDistrict,
  getDistrictSubstations
} = require("../controllers/district.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getDistricts));

router.get("/:id", asyncHandler(getDistrict));

router.get(
  "/:id/substations",
  asyncHandler(getDistrictSubstations)
);

module.exports = router;