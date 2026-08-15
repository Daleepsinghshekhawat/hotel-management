const mongoose = require("mongoose");

const adminAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
     default:""
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    address: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    criminalCase: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("AdminAccount", adminAccountSchema);