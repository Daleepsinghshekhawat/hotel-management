const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    Statename: {
      type: String,
      required: true,
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

module.exports = mongoose.model("states", stateSchema);