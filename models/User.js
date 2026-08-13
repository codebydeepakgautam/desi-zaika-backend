const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==============================
    // USER NAME
    // ==============================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ==============================
    // EMAIL
    // ==============================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==============================
    // PHONE
    // ==============================
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ==============================
    // PASSWORD
    // ==============================
    password: {
      type: String,
      required: true,
    },

    // ==============================
    // PASSWORD RESET OTP
    // ==============================
    resetOtp: {
      type: String,
      default: null,
    },

    // ==============================
    // OTP EXPIRY
    // ==============================
    resetOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);