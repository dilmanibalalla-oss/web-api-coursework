const SolarInstallation = require("../models/SolarInstallation");
const GridSubstation = require("../models/GridSubstation");
const District = require("../models/District");
const Province = require("../models/Province");

async function getInstallation(req, res) {
  const installation = await SolarInstallation.findById(
    req.params.id
  )
    .select("-devicePasswordHash")
    .populate({
      path: "substationId",
      select: "name code districtId",
      populate: {
        path: "districtId",
        select: "name provinceId",
        populate: {
          path: "provinceId",
          select: "name code"
        }
      }
    })
    .lean();

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No installation exists with ID ${req.params.id}.`
    });
  }

  res.status(200).json({
    data: installation
  });
}

async function createInstallation(req, res) {
  const {
    name,
    meterId,
    inverterId,
    capacityKw,
    substationId,
    latitude,
    longitude,
    status,
    devicePassword
  } = req.body;

  const bcrypt = require("bcryptjs");

  const devicePasswordHash =
    await bcrypt.hash(devicePassword, 12);

  const installation =
    await SolarInstallation.create({
      name,
      meterId,
      inverterId,
      capacityKw,
      substationId,
      latitude,
      longitude,
      status,
      devicePasswordHash
    });

  res
    .status(201)
    .location(
      `/api/installations/${installation._id}`
    )
    .json({
      data: {
        id: installation._id,
        name: installation.name,
        meterId: installation.meterId,
        inverterId: installation.inverterId,
        capacityKw: installation.capacityKw,
        substationId: installation.substationId,
        status: installation.status
      }
    });
}

async function updateInstallation(req, res) {
  const allowedFields = [
    "name",
    "meterId",
    "inverterId",
    "capacityKw",
    "substationId",
    "latitude",
    "longitude",
    "status"
  ];

  const update = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      update[field] = req.body[field];
    }
  }

  const installation =
    await SolarInstallation.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true
      }
    )
      .select("-devicePasswordHash")
      .lean();

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No installation exists with ID ${req.params.id}.`
    });
  }

  res.status(200).json({
    data: installation
  });
}

async function deleteInstallation(req, res) {
  const installation =
    await SolarInstallation.findByIdAndDelete(
      req.params.id
    );

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No installation exists with ID ${req.params.id}.`
    });
  }

  res.status(204).send();
}

async function getInstallationDetails(req, res) {
  const installation =
    await SolarInstallation.findById(req.params.id)
      .select("-devicePasswordHash")
      .lean();

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Solar installation not found.",
      detail: `No installation exists with ID ${req.params.id}.`
    });
  }

  const substation =
    await GridSubstation.findById(
      installation.substationId
    ).lean();

  const district =
    await District.findById(
      substation.districtId
    ).lean();

  const province =
    await Province.findById(
      district.provinceId
    ).lean();

  res.status(200).json({
    data: {
      installation,
      substation,
      district,
      province
    }
  });
}

module.exports = {
  getInstallation,
  createInstallation,
  updateInstallation,
  deleteInstallation,
  getInstallationDetails
};