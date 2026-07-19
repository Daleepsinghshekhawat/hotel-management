const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cities",
      required: true,
    },
    

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    registrationId: {
      type: String,
      required: true,
      unique: true,
    },

    submittedBy: {
      type: String,
      required: true,
      trim: true,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotelrequest",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("hotels", hotelSchema);
