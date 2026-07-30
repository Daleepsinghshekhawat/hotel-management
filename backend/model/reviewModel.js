const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Approved",
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("reviews", reviewSchema);
