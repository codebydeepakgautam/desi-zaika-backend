const express = require("express");

const {
  createOrder,
  getOrders,
  getUserOrders,
  getSingleOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} = require("../controllers/orderController");

const router = express.Router();

// =====================================================
// CREATE ORDER
// POST /api/orders
// =====================================================

router.post("/", createOrder);

// =====================================================
// GET ALL ORDERS
// GET /api/orders
//
// ADMIN USE
// =====================================================

router.get("/", getOrders);

// =====================================================
// GET USER ORDERS
// GET /api/orders/user/:userId
//
// NORMAL USER USE
// =====================================================

router.get(
  "/user/:userId",
  getUserOrders
);

// =====================================================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =====================================================

router.get(
  "/:orderId",
  getSingleOrder
);

// =====================================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:orderId/status
//
// ADMIN USE
// =====================================================

router.patch(
  "/:orderId/status",
  updateOrderStatus
);

// =====================================================
// CANCEL USER ORDER
// PATCH /api/orders/:orderId/cancel
// =====================================================

router.patch(
  "/:orderId/cancel",
  cancelOrder
);

// =====================================================
// DELETE ORDER
// DELETE /api/orders/:orderId
//
// ADMIN USE
// =====================================================

router.delete(
  "/:orderId",
  deleteOrder
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;