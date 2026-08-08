const mongoose = require("mongoose");

const hotelRequestSchema = new mongoose.Schema(
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

    submittedBy: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: [{
      type: String,
    }],

    registrationId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "inactive"],
      default: "pending",
    },

    review: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    hotelType: {
      type: String,
      enum: ["Hotel", "Resort", "Villa", "Homestay", "Hostel"],
      default: "Hotel",
    },

    amenities: [{
      type: String,
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("hotelrequest", hotelRequestSchema);