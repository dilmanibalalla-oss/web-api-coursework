const GridSubstation = require("../models/GridSubstation");
const SolarInstallation = require("../models/SolarInstallation");

async function getSubstations(req, res) {
  const substations = await GridSubstation.find()
    .populate("districtId", "name")
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    data: substations
  });
}

async function getSubstation(req, res) {
  const substation = await GridSubstation.findById(req.params.id)
    .populate("districtId", "name")
    .lean();

  if (!substation) {
    return res.status(404).json({
      code: "SUBSTATION_NOT_FOUND",
      message: "Grid substation not found.",
      detail: `No substation exists with ID ${req.params.id}.`
    });
  }

  res.status(200).json({
    data: substation
  });
}

async function getSubstationInstallations(req, res) {
  const substation = await GridSubstation.exists({
    _id: req.params.id
  });

  if (!substation) {
    return res.status(404).json({
      code: "SUBSTATION_NOT_FOUND",
      message: "Grid substation not found.",
      detail: `No substation exists with ID ${req.params.id}.`
    });
  }

  const installations = await SolarInstallation.find({
    substationId: req.params.id
  })
    .select("-devicePasswordHash")
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    data: installations
  });
}

module.exports = {
  getSubstations,
  getSubstation,
  getSubstationInstallations
};