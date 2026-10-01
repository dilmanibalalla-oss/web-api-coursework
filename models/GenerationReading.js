const mongoose = require("mongoose");

const generationReadingSchema = new mongoose.Schema(
  {
    installationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SolarInstallation",
      required: true,
      index: true
    },

    timestamp: {
      type: Date,
      required: true,
      index: true
    },

    powerKw: {
      type: Number,
      required: true,
      min: 0
    },

    energyKwh: {
      type: Number,
      required: true,
      min: 0
    },

    voltage: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

generationReadingSchema.index({
  installationId: 1,
  timestamp: -1
});

module.exports = mongoose.model(
  "GenerationReading",
  generationReadingSchema
);