const express = require("express");

const {
  loginUser,
  loginDevice
} = require("../controllers/auth.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/**
 * @openapi
 * /api/auth/user/login:
 *   post:
 *     summary: Authenticate user and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@energy.gov.lk
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/user/login",
  asyncHandler(loginUser)
);

/**
 * @openapi
 * /api/auth/device/login:
 *   post:
 *     summary: Authenticate IoT meter device and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - password
 *             properties:
 *               meterId:
 *                 type: string
 *                 example: MTR-COL-001
 *               password:
 *                 type: string
 *                 example: SecretDevicePass123!
 *     responses:
 *       200:
 *         description: Device login successful
 *       401:
 *         description: Invalid device credentials
 */
router.post(
  "/device/login",
  asyncHandler(loginDevice)
);

module.exports = router;