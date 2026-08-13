const mongoose = require("mongoose");

// =====================================================
// REVIEW SCHEMA
// =====================================================

const reviewSchema = new mongoose.Schema(
  {
    // Food ID
    foodId: {
      type: Number,
      required: true,
    },

    // Food Name
    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    // User ID
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    // User Name
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    // Rating 1 - 5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Customer Comment
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Order ID
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// INDEX
// =====================================================

reviewSchema.index({
  foodId: 1,
  createdAt: -1,
});

reviewSchema.index({
  orderId: 1,
});

reviewSchema.index({
  userId: 1,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model("Review", reviewSchema);