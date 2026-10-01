const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "NATIONAL",
        "PROVINCIAL",
        "DISTRICT"
      ],
      required: true
    },

    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      default: null
    },

    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);