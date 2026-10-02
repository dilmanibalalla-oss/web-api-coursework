const express = require("express");

const {
  getDistricts,
  getDistrict,
  getDistrictSubstations
} = require("../controllers/district.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * @openapi
 * /api/districts:
 *   get:
 *     summary: Get list of all districts
 *     tags: [Districts]
 *     responses:
 *       200:
 *         description: List of districts retrieved successfully
 */
router.get("/", asyncHandler(getDistricts));

/**
 * @openapi
 * /api/districts/{id}:
 *   get:
 *     summary: Get district details by ID
 *     tags: [Districts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: District Mongo ID
 *     responses:
 *       200:
 *         description: District details retrieved successfully
 *       404:
 *         description: District not found
 */
router.get("/:id", asyncHandler(getDistrict));

/**
 * @openapi
 * /api/districts/{id}/substations:
 *   get:
 *     summary: Get grid substations located in a specific district
 *     tags: [Districts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: District Mongo ID
 *     responses:
 *       200:
 *         description: List of substations retrieved successfully
 *       404:
 *         description: District not found
 */
router.get(
  "/:id/substations",
  asyncHandler(getDistrictSubstations)
);

module.exports = router;