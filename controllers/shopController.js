const Shop = require("../models/Shop");

// =====================================================
// GET SHOP STATUS
// =====================================================

const getShopStatus = async (req, res) => {
  try {
    let shop = await Shop.findOne();

    // Agar shop record nahi hai
    if (!shop) {
      shop = await Shop.create({
        isOpen: true,
        openingTime: "07:30",
        closingTime: "15:00",
      });
    }

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("❌ Shop Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get shop status",
    });
  }
};

// =====================================================
// OPEN / CLOSE SHOP
// =====================================================

const toggleShop = async (req, res) => {
  try {
    console.log("🏪 SHOP UPDATE BODY:", req.body);

    let shop = await Shop.findOne();

    // ==========================================
    // CREATE SHOP IF NOT EXISTS
    // ==========================================

    if (!shop) {
      shop = await Shop.create({
        isOpen:
          typeof req.body.isOpen === "boolean"
            ? req.body.isOpen
            : true,

        openingTime: "07:30",
        closingTime: "15:00",
      });
    } else {
      // ==========================================
      // FRONTEND SE STATUS LO
      // ==========================================

      if (typeof req.body.isOpen === "boolean") {
        shop.isOpen = req.body.isOpen;
      } else {
        // Agar status nahi bheja gaya
        shop.isOpen = !shop.isOpen;
      }

      await shop.save();
    }

    console.log(
      shop.isOpen
        ? "🟢 SHOP IS OPEN"
        : "🔴 SHOP IS CLOSED"
    );

    res.status(200).json({
      success: true,

      message: shop.isOpen
        ? "Shop opened successfully"
        : "Shop closed successfully",

      shop,
    });
  } catch (error) {
    console.error("❌ Toggle Shop Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update shop status",
      error: error.message,
    });
  }
};

module.exports = {
  getShopStatus,
  toggleShop,
};