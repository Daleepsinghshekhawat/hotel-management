const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // References
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      required: true,
    },

    // Guest Information
    guestName: {
      type: String,
      required: true,
      trim: true,
    },

    guestEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },

    guests: {
      type: Number,
      default: 1,
    },

    // Dates
    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    nights: {
      type: Number,
      required: true,
    },

    // Pricing
    pricePerNight: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // Booking Status
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "pending"],
      default: "confirmed",
    },

    bookingId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-generate booking ID before save
bookingSchema.pre("save", function () {
  if (!this.bookingId) {
    this.bookingId = "BK" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
});

module.exports = mongoose.model("bookings", bookingSchema);
