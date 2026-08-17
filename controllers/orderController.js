const mongoose = require("mongoose");
const Order = require("../models/Order");

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

const createOrder = async (req, res) => {
  try {
    console.log("📦 CREATE ORDER REQUEST");
    console.log(req.body);

    const {
      orderId,
      userId,
      customer,
      items,
      subtotal,
      distance,
      deliveryCharge,
      total,
      payment,
      paymentId,
      razorpayOrderId,
    } = req.body;

    // =================================================
    // USER ID VALIDATION
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID.",
      });
    }

    // =================================================
    // ORDER ID
    // =================================================
    // Agar frontend orderId nahi bhejta,
    // backend khud generate karega.
    // =================================================

    const finalOrderId =
      orderId ||
      `DZ-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

    // =================================================
    // CUSTOMER VALIDATION
    // =================================================

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required.",
      });
    }

    if (
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All customer details are required.",
      });
    }

    // =================================================
    // ITEMS VALIDATION
    // =================================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    // =================================================
    // NORMALIZE ITEMS
    // =================================================

    const normalizedItems = items.map((item) => ({
      id: Number(item.id ?? item.foodId),

      name: String(item.name || "").trim(),

      price: Number(item.price),

      quantity: Number(item.quantity),

      image: item.image || null,

      emoji: item.emoji || "🍽️",
    }));

    // =================================================
    // VALIDATE ITEMS
    // =================================================

    for (const item of normalizedItems) {
      if (
        !Number.isFinite(item.id) ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order item data.",
          item,
        });
      }
    }

    // =================================================
    // PRICE VALUES
    // =================================================

    const normalizedSubtotal = Number(subtotal);

    const normalizedDistance = Number(distance);

    const normalizedDeliveryCharge =
      Number(deliveryCharge);

    const normalizedTotal = Number(total);

    // =================================================
    // PRICE VALIDATION
    // =================================================

    if (
      !Number.isFinite(normalizedSubtotal) ||
      normalizedSubtotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal.",
      });
    }

    if (
      !Number.isFinite(normalizedDistance) ||
      normalizedDistance < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid distance.",
      });
    }

    if (
      !Number.isFinite(normalizedDeliveryCharge) ||
      normalizedDeliveryCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery charge.",
      });
    }

    if (
      !Number.isFinite(normalizedTotal) ||
      normalizedTotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount.",
      });
    }

    // =================================================
    // PAYMENT
    // =================================================

    const normalizedPayment =
      String(payment || "COD")
        .trim()
        .toUpperCase() === "ONLINE"
        ? "ONLINE"
        : "COD";

    // =================================================
    // CHECK DUPLICATE ORDER
    // =================================================

    const existingOrder = await Order.findOne({
      orderId: finalOrderId,
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order already exists.",
        order: existingOrder,
      });
    }

    // =================================================
    // CREATE ORDER
    // =================================================

    const order = await Order.create({
      // =================================================
      // IMPORTANT
      // MongoDB ObjectId me save hoga
      // =================================================

      userId: new mongoose.Types.ObjectId(userId),

      orderId: finalOrderId,

      customer: {
        name: String(customer.name).trim(),

        phone: String(customer.phone).trim(),

        address: String(customer.address).trim(),

        city: String(customer.city).trim(),

        pincode: String(customer.pincode).trim(),
      },

      items: normalizedItems,

      subtotal: normalizedSubtotal,

      distance: normalizedDistance,

      deliveryCharge: normalizedDeliveryCharge,

      total: normalizedTotal,

      payment: normalizedPayment,

      paymentId: paymentId || null,

      razorpayOrderId: razorpayOrderId || null,

      status: "PLACED",

      cancellationReason: null,

      cancellationMessage: null,
    });

    // =================================================
    // SUCCESS LOG
    // =================================================

    console.log(
      "✅ ORDER CREATED:",
      order.orderId
    );

    console.log(
      "👤 ORDER USER ID:",
      order.userId.toString()
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message: "Order created successfully.",

      order,
    });
  } catch (error) {
    console.error(
      "❌ CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Unable to create order.",

      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ORDERS
// GET /api/orders
//
// ADMIN USE ONLY
// =====================================================

const getOrders = async (req, res) => {
  try {
    console.log("📦 GET ALL ORDERS - ADMIN");

    const orders = await Order.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log(
      "📦 ORDERS COUNT:",
      orders.length
    );

    return res.status(200).json({
      success: true,

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "❌ GET ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Unable to fetch orders.",

      error: error.message,
    });
  }
};

// =====================================================
// GET USER ORDERS
// GET /api/orders/user/:userId
//
// NORMAL USER USE
// =====================================================

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(
      "👤 GET USER ORDERS:",
      userId
    );

    // =================================================
    // USER ID VALIDATION
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,

        message: "User ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid User ID.",
      });
    }

    // =================================================
    // ONLY THIS USER'S ORDERS
    // =================================================

    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log(
      "📦 USER ORDERS COUNT:",
      orders.length
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      count: orders.length,

      orders,
    });
  } catch (error) {
    console.error(
      "❌ GET USER ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Unable to fetch user orders.",

      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =====================================================

const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,

        message: "Order ID is required.",
      });
    }

    const order = await Order.findOne({
      orderId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,

      order,
    });
  } catch (error) {
    console.error(
      "❌ SINGLE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Unable to fetch order.",

      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:orderId/status
//
// ADMIN USE
// =====================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { status } = req.body;

    // =================================================
    // ALLOWED STATUS
    // =================================================

    const allowedStatuses = [
      "PLACED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    // =================================================
    // STATUS VALIDATION
    // =================================================

    if (!status) {
      return res.status(400).json({
        success: false,

        message: "Status is required.",
      });
    }

    const normalizedStatus = String(status)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {
      return res.status(400).json({
        success: false,

        message: "Invalid order status.",

        allowedStatuses,
      });
    }

    // =================================================
    // FIND ORDER
    // =================================================

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    // =================================================
    // UPDATE STATUS
    // =================================================

    order.status = normalizedStatus;

    await order.save();

    console.log(
      `✅ ORDER STATUS UPDATED: ${order.orderId} → ${order.status}`
    );

    return res.status(200).json({
      success: true,

      message:
        "Order status updated successfully.",

      order,
    });
  } catch (error) {
    console.error(
      "❌ UPDATE STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to update order status.",

      error: error.message,
    });
  }
};

// =====================================================
// CANCEL ORDER
// PATCH /api/orders/:orderId/cancel
// =====================================================

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { userId, reason } = req.body;

    console.log(
      "❌ CANCEL ORDER REQUEST"
    );

    console.log(
      "Order ID:",
      orderId
    );

    console.log(
      "User ID:",
      userId
    );

    console.log(
      "Reason:",
      reason
    );

    // =================================================
    // USER ID VALIDATION
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,

        message: "User ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,

        message: "Invalid User ID.",
      });
    }

    // =================================================
    // REASON VALIDATION
    // =================================================

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,

        message:
          "Cancellation reason is required.",
      });
    }

    // =================================================
    // FIND ONLY THIS USER'S ORDER
    // =================================================

    const order = await Order.findOne({
      orderId,

      userId:
        new mongoose.Types.ObjectId(userId),
    });

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    // =================================================
    // STATUS CHECK
    // =================================================

    if (order.status !== "PLACED") {
      return res.status(400).json({
        success: false,

        message:
          "Only placed orders can be cancelled.",
      });
    }

    // =================================================
    // CANCEL ORDER
    // =================================================

    const cleanReason =
      reason.trim();

    order.status = "CANCELLED";

    order.cancellationReason =
      cleanReason;

    order.cancellationMessage =
      `Customer cancelled this order. Reason: ${cleanReason}`;

    // =================================================
    // SAVE
    // =================================================

    await order.save();

    console.log(
      "❌ ORDER CANCELLED:",
      order.orderId
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully.",

      order,
    });
  } catch (error) {
    console.error(
      "❌ CANCEL ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to cancel order.",

      error: error.message,
    });
  }
};

// =====================================================
// DELETE ORDER
// DELETE /api/orders/:orderId
//
// ADMIN USE
// =====================================================

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(
      "🗑️ DELETE ORDER:",
      orderId
    );

    const order =
      await Order.findOneAndDelete({
        orderId,
      });

    if (!order) {
      return res.status(404).json({
        success: false,

        message: "Order not found.",
      });
    }

    console.log(
      "✅ ORDER DELETED:",
      order.orderId
    );

    return res.status(200).json({
      success: true,

      message:
        "Order deleted successfully.",

      order,
    });
  } catch (error) {
    console.error(
      "❌ DELETE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to delete order.",

      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createOrder,
  getOrders,
  getUserOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};