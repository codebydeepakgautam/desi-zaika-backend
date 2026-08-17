const mongoose = require("mongoose");

// =====================================================
// ORDER ITEM SCHEMA
// =====================================================

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: null,
    },

    emoji: {
      type: String,
      default: "🍽️",
    },
  },
  { _id: false }
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // =================================================
    // USER ID
    // =================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // ORDER ID
    // =================================================

    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // =================================================
    // CUSTOMER
    // =================================================

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // =================================================
    // ITEMS
    // =================================================

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    // =================================================
    // PRICE
    // =================================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // =================================================
    // PAYMENT
    // =================================================

    payment: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentId: {
      type: String,
      default: null,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    // =================================================
    // STATUS
    // =================================================

    status: {
      type: String,
      enum: [
        "PLACED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    // =================================================
    // CANCELLATION
    // =================================================

    cancellationReason: {
      type: String,
      default: null,
    },

    cancellationMessage: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model("Order", orderSchema);