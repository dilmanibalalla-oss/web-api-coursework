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
} = require("../middlewares/auth.middleware");

const etag = require("../middlewares/etag.middleware");

const router = express.Router();

/**
 * @openapi
 * /api/readings:
 *   get:
 *     summary: Get all generation readings with filtering and pagination
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: provinceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: string
 *       - in: query
 *         name: substationId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated readings list
 *       401:
 *         description: Unauthenticated
 */
router.get(
  "/",
  authenticate,
  asyncHandler(getAllReadings)
);

/**
 * @openapi
 * /api/readings/{installationId}:
 *   get:
 *     summary: Get paginated generation readings for a specific installation
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: installationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Installation readings retrieved
 *       401:
 *         description: Unauthenticated
 */
router.get(
  "/:installationId",
  authenticate,
  asyncHandler(getInstallationReadings)
);

/**
 * @openapi
 * /api/readings/{installationId}/last-reading:
 *   get:
 *     summary: Get the latest reading for an installation
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: installationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest reading retrieved successfully
 *       304:
 *         description: Not modified (ETag match)
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: No reading available
 */
router.get(
  "/:installationId/last-reading",
  authenticate,
  etag,
  asyncHandler(getLastReading)
);

/**
 * @openapi
 * /api/readings/{installationId}/{readingId}:
 *   get:
 *     summary: Get a specific generation reading by ID
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: installationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: readingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reading retrieved successfully
 *       401:
 *         description: Unauthenticated
 *       404:
 *         description: Reading not found
 */
router.get(
  "/:installationId/:readingId",
  authenticate,
  asyncHandler(getReading)
);

/**
 * @openapi
 * /api/readings/{installationId}:
 *   post:
 *     summary: Create a generation reading (Device authenticated)
 *     tags: [Readings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: installationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - powerKw
 *               - energyKwh
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               powerKw:
 *                 type: number
 *                 example: 12.5
 *               energyKwh:
 *                 type: number
 *                 example: 150.2
 *               voltage:
 *                 type: number
 *                 example: 230.1
 *     responses:
 *       201:
 *         description: Reading created
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Device scope violation or non-DEVICE role)
 *       404:
 *         description: Installation not found
 */
router.post(
  "/:installationId",
  authenticate,
  requireRoles("DEVICE"),
  asyncHandler(createReading)
);

module.exports = router;