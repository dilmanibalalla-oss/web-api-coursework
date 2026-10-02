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
} = require("../middlewares/auth.middleware");

const etag = require("../middlewares/etag.middleware");

const router = express.Router();

/**
 * @openapi
 * /api/installations:
 *   post:
 *     summary: Create a new solar installation
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - meterId
 *               - inverterId
 *               - capacityKw
 *               - substationId
 *               - devicePassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: Colombo Rooftop Solar 1
 *               meterId:
 *                 type: string
 *                 example: MTR-COL-001
 *               inverterId:
 *                 type: string
 *                 example: INV-SMA-5000
 *               capacityKw:
 *                 type: number
 *                 example: 50
 *               substationId:
 *                 type: string
 *                 example: 64f1a2b3c4d5e6f7a8b9c0d1
 *               latitude:
 *                 type: number
 *                 example: 6.9271
 *               longitude:
 *                 type: number
 *                 example: 79.8612
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *                 default: ACTIVE
 *               devicePassword:
 *                 type: string
 *                 example: SecretDevicePass123!
 *     responses:
 *       201:
 *         description: Installation created successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Requires NATIONAL role)
 */
router.post(
  "/",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(createInstallation)
);

/**
 * @openapi
 * /api/installations/{id}:
 *   get:
 *     summary: Get solar installation by ID
 *     tags: [Installations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installation Mongo ID
 *     responses:
 *       200:
 *         description: Installation details retrieved successfully
 *       304:
 *         description: Not modified (ETag match)
 *       404:
 *         description: Installation not found
 */
router.get(
  "/:id",
  etag,
  asyncHandler(getInstallation)
);

/**
 * @openapi
 * /api/installations/{id}/details:
 *   get:
 *     summary: Get full installation hierarchy (substation, district, province)
 *     tags: [Installations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Installation Mongo ID
 *     responses:
 *       200:
 *         description: Detailed installation hierarchy retrieved
 *       404:
 *         description: Installation not found
 */
router.get(
  "/:id/details",
  asyncHandler(getInstallationDetails)
);

/**
 * @openapi
 * /api/installations/{id}:
 *   put:
 *     summary: Update a solar installation
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               meterId:
 *                 type: string
 *               inverterId:
 *                 type: string
 *               capacityKw:
 *                 type: number
 *               substationId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Installation updated
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Requires NATIONAL role)
 *       404:
 *         description: Installation not found
 */
router.put(
  "/:id",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(updateInstallation)
);

/**
 * @openapi
 * /api/installations/{id}:
 *   delete:
 *     summary: Delete a solar installation
 *     tags: [Installations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Installation deleted successfully
 *       401:
 *         description: Unauthenticated
 *       403:
 *         description: Forbidden (Requires NATIONAL role)
 *       404:
 *         description: Installation not found
 */
router.delete(
  "/:id",
  authenticate,
  requireRoles("NATIONAL"),
  asyncHandler(deleteInstallation)
);

module.exports = router;