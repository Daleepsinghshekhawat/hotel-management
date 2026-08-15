const mongoose = require("mongoose");

const tempBookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // TTL index: automatically deletes document after 300 seconds (5 minutes)
      expires: 300,
    },
  }
);

module.exports = mongoose.model("tempBookings", tempBookingSchema);
