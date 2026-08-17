
const express = require("express");

const router = express.Router();

const {
  getShopStatus,
  toggleShop,
} = require("../controllers/shopController");

// =====================================================
// GET SHOP STATUS
// GET /api/shop
// =====================================================

router.get("/", getShopStatus);

// =====================================================
// OPEN / CLOSE SHOP
// POST /api/shop/toggle
// =====================================================

router.post("/toggle", toggleShop);

module.exports = router;