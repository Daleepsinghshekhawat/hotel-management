const mongoose = require("mongoose");

const hotelRequestSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
    },
    ownerPhone: {
      type: String,
    },
    hotelName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    place: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    facilities: [
      {
        type: String, // e.g. "WiFi", "Pool", "Parking"
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("hotelrequests", hotelRequestSchema);
