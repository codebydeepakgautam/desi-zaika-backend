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
  {
    _id: false,
  }
);

// =====================================================
// ORDER SCHEMA
// =====================================================

const orderSchema = new mongoose.Schema(
  {
    // =================================================
    // ORDER ID
    // =================================================

    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =================================================
    // USER ID
    // =================================================

    userId: {
      type: String,
      required: false,
      default: null,
      trim: true,
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
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },

        message:
          "Order must contain at least one item",
      },
    },

    // =================================================
    // PRICE DETAILS
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

      enum: [
        "COD",
        "ONLINE",
      ],

      default: "COD",
    },

    // =================================================
    // RAZORPAY PAYMENT ID
    // =================================================

    paymentId: {
      type: String,
      default: null,
      trim: true,
    },

    // =================================================
    // RAZORPAY ORDER ID
    // =================================================

    razorpayOrderId: {
      type: String,
      default: null,
      trim: true,
    },

    // =================================================
    // ORDER STATUS
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
    // CANCELLATION REASON
    // =================================================

    cancellationReason: {
      type: String,
      default: null,
      trim: true,
    },

    // =================================================
    // CANCELLATION MESSAGE
    // =================================================

    cancellationMessage: {
      type: String,
      default: null,
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

orderSchema.index({
  userId: 1,
  status: 1,
});

// =====================================================
// EXPORT MODEL
// =====================================================

module.exports = mongoose.model(
  "Order",
  orderSchema
);