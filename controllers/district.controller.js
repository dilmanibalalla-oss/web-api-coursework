const District = require("../models/District");
const GridSubstation = require("../models/GridSubstation");

async function getDistricts(req, res) {
  const districts = await District.find()
    .populate("provinceId", "name code")
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    data: districts
  });
}

async function getDistrict(req, res) {
  const district = await District.findById(req.params.id)
    .populate("provinceId", "name code")
    .lean();

  if (!district) {
    return res.status(404).json({
      code: "DISTRICT_NOT_FOUND",
      message: "District not found.",
      detail: `No district exists with ID ${req.params.id}.`
    });
  }

  res.status(200).json({
    data: district
  });
}

async function getDistrictSubstations(req, res) {
  const district = await District.exists({
    _id: req.params.id
  });

  if (!district) {
    return res.status(404).json({
      code: "DISTRICT_NOT_FOUND",
      message: "District not found.",
      detail: `No district exists with ID ${req.params.id}.`
    });
  }

  const substations = await GridSubstation.find({
    districtId: req.params.id
  })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    data: substations
  });
}

module.exports = {
  getDistricts,
  getDistrict,
  getDistrictSubstations
};