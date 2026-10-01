const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const SolarInstallation = require("../models/SolarInstallation");

function createToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: "8h"
    }
  );
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email?.toLowerCase()
  });

  if (!user) {
    return res.status(401).json({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      detail: "The supplied credentials could not be verified."
    });
  }

  const valid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!valid) {
    return res.status(401).json({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      detail: "The supplied credentials could not be verified."
    });
  }

  const token = createToken({
    type: "USER",
    userId: user._id.toString(),
    role: user.role,
    provinceId: user.provinceId?.toString() || null,
    districtId: user.districtId?.toString() || null
  });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      provinceId: user.provinceId,
      districtId: user.districtId
    }
  });
}

async function loginDevice(req, res) {
  const { meterId, password } = req.body;

  const installation = await SolarInstallation.findOne({
    meterId
  });

  if (!installation) {
    return res.status(401).json({
      code: "INVALID_DEVICE_CREDENTIALS",
      message: "Invalid device credentials.",
      detail: "The supplied meter credentials could not be verified."
    });
  }

  const valid = await bcrypt.compare(
    password,
    installation.devicePasswordHash
  );

  if (!valid) {
    return res.status(401).json({
      code: "INVALID_DEVICE_CREDENTIALS",
      message: "Invalid device credentials.",
      detail: "The supplied meter credentials could not be verified."
    });
  }

  const token = createToken({
    type: "DEVICE",
    role: "DEVICE",
    installationId: installation._id.toString()
  });

  res.status(200).json({
    token,
    installation: {
      id: installation._id,
      meterId: installation.meterId,
      name: installation.name
    }
  });
}

module.exports = {
  loginUser,
  loginDevice
};