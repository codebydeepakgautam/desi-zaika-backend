const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
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
    // CUSTOMER VALIDATION
    // =================================================

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
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
        message: "All customer details are required",
      });
    }

    // =================================================
    // ITEMS VALIDATION
    // =================================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // =================================================
    // NORMALIZE ITEMS
    // =================================================

    const orderItems = items.map((item) => ({
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

    for (const item of orderItems) {
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
          message: "Invalid order item data",
          item,
        });
      }
    }

    // =================================================
    // PRICE VALIDATION
    // =================================================

    const normalizedSubtotal = Number(subtotal);
    const normalizedDistance = Number(distance);
    const normalizedDeliveryCharge = Number(deliveryCharge);
    const normalizedTotal = Number(total);

    if (
      !Number.isFinite(normalizedSubtotal) ||
      normalizedSubtotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subtotal",
      });
    }

    if (
      !Number.isFinite(normalizedDistance) ||
      normalizedDistance < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid distance",
      });
    }

    if (
      !Number.isFinite(normalizedDeliveryCharge) ||
      normalizedDeliveryCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery charge",
      });
    }

    if (
      !Number.isFinite(normalizedTotal) ||
      normalizedTotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount",
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
    // GENERATE ORDER ID
    // =================================================

    const orderId = `DZ-${Date.now()}`;

    // =================================================
    // CREATE ORDER
    // =================================================

    const order = await Order.create({
      orderId,

      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        pincode: customer.pincode.trim(),
      },

      items: orderItems,

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

    console.log(
      "✅ Database Order Created:",
      order.orderId
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(
      "❌ Create Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL ORDERS
// GET /api/orders
// =====================================================

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =====================================================

router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "❌ Get Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:orderId/status
// =====================================================

router.patch(
  "/:orderId/status",
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "PLACED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
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
          message: "Invalid order status",
          allowedStatuses,
        });
      }

      const order =
        await Order.findOneAndUpdate(
          {
            orderId: req.params.orderId,
          },
          {
            $set: {
              status: normalizedStatus,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      console.log(
        `✅ Order ${order.orderId} status: ${order.status}`
      );

      return res.json({
        success: true,
        message:
          "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "❌ Update Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
        error: error.message,
      });
    }
  }
);

// =====================================================
// CUSTOMER CANCEL ORDER
// PATCH /api/orders/:orderId/cancel
// =====================================================

router.patch(
  "/:orderId/cancel",
  async (req, res) => {
    try {
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Cancellation reason is required",
        });
      }

      const order = await Order.findOne({
        orderId: req.params.orderId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Only PLACED orders can be cancelled
      if (order.status !== "PLACED") {
        return res.status(400).json({
          success: false,
          message:
            "Order cannot be cancelled after preparation has started",
        });
      }

      order.status = "CANCELLED";

      order.cancellationReason =
        reason.trim();

      order.cancellationMessage =
        `Customer cancelled this order. Reason: ${reason.trim()}`;

      await order.save();

      console.log(
        `❌ Order Cancelled: ${order.orderId}`
      );

      return res.status(200).json({
        success: true,
        message:
          "Order cancelled successfully",
        order: {
          orderId: order.orderId,
          status: order.status,
          cancellationReason:
            order.cancellationReason,
          cancellationMessage:
            order.cancellationMessage,
        },
      });
    } catch (error) {
      console.error(
        "❌ Cancel Order Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel order",
        error: error.message,
      });
    }
  }
);

// =====================================================
// DELETE ORDER - ADMIN
// DELETE /api/orders/:orderId
// =====================================================

router.delete(
  "/:orderId",
  async (req, res) => {
    try {
      const { orderId } = req.params;

      console.log(
        "🗑️ ADMIN DELETE ORDER:",
        orderId
      );

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const deletedOrder =
        await Order.findOneAndDelete({
          orderId,
        });

      if (!deletedOrder) {
        console.log(
          "❌ Order Not Found:",
          orderId
        );

        return res.status(404).json({
          success: false,
          message: "Order not found",
          orderId,
        });
      }

      console.log(
        "✅ ORDER DELETED:",
        deletedOrder.orderId
      );

      return res.status(200).json({
        success: true,
        message:
          "Order deleted successfully",
        orderId:
          deletedOrder.orderId,
      });
    } catch (error) {
      console.error(
        "❌ DELETE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete order",
        error: error.message,
      });
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;