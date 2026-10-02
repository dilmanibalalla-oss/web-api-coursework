const express = require("express");

const {
  getSubstations,
  getSubstation,
  getSubstationInstallations
} = require("../controllers/substation.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * @openapi
 * /api/substations:
 *   get:
 *     summary: Get list of all grid substations
 *     tags: [Substations]
 *     responses:
 *       200:
 *         description: List of grid substations
 */
router.get("/", asyncHandler(getSubstations));

/**
 * @openapi
 * /api/substations/{id}:
 *   get:
 *     summary: Get grid substation by ID
 *     tags: [Substations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Substation Mongo ID
 *     responses:
 *       200:
 *         description: Grid substation details
 *       404:
 *         description: Grid substation not found
 */
router.get("/:id", asyncHandler(getSubstation));

/**
 * @openapi
 * /api/substations/{id}/installations:
 *   get:
 *     summary: Get solar installations connected to a grid substation
 *     tags: [Substations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Substation Mongo ID
 *     responses:
 *       200:
 *         description: List of solar installations
 *       404:
 *         description: Grid substation not found
 */
router.get(
  "/:id/installations",
  asyncHandler(getSubstationInstallations)
);

module.exports = router;