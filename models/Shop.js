const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },

    openingTime: {
      type: String,
      default: "07:30",
    },

    closingTime: {
      type: String,
      default: "15:00",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shop", shopSchema);