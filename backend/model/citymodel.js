const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    cityname: String,

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "states",
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "districts",
    },

    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("cities", citySchema);