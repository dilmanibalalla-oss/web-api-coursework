const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

districtSchema.index(
  { name: 1, provinceId: 1 },
  { unique: true }
);

module.exports = mongoose.model("District", districtSchema);