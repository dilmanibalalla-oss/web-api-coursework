const mongoose = require("mongoose");

const solarInstallationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    meterId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    inverterId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    capacityKw: {
      type: Number,
      required: true,
      min: 0
    },

    substationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GridSubstation",
      required: true,
      index: true
    },

    latitude: {
      type: Number
    },

    longitude: {
      type: Number
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
      default: "ACTIVE"
    },

    devicePasswordHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "SolarInstallation",
  solarInstallationSchema
);