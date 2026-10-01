const express = require("express");

const {
  loginUser,
  loginDevice
} = require("../controllers/auth.controller");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/user/login",
  asyncHandler(loginUser)
);

router.post(
  "/device/login",
  asyncHandler(loginDevice)
);

module.exports = router;