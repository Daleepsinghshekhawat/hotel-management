const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    districtname: String,
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "states",
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


module.exports = mongoose.model("districts", districtSchema);
