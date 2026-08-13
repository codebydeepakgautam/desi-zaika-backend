const express = require("express");
const crypto = require("crypto");

const razorpay = require("../config/razorpay");

const router = express.Router();

// =====================================================
// CREATE RAZORPAY ORDER
// POST /api/payment/create-order
// =====================================================

router.post("/create-order", async (req, res) => {
  try {
    console.log("=================================");
    console.log("📩 CREATE ORDER REQUEST");
    console.log("Body:", req.body);

    const { amount } = req.body;

    const numericAmount = Number(amount);

    console.log("💰 Amount:", numericAmount);

    // ---------------------------------------------
    // VALIDATE AMOUNT
    // ---------------------------------------------

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      console.log("❌ Invalid amount");

      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // ---------------------------------------------
    // CONVERT RUPEES → PAISE
    // ---------------------------------------------

    const amountInPaise = Math.round(numericAmount * 100);

    console.log("💵 Amount in paise:", amountInPaise);

    // ---------------------------------------------
    // CREATE RAZORPAY ORDER
    // ---------------------------------------------

    console.log("🚀 Creating Razorpay order...");

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `DZ_${Date.now()}`,
    });

    console.log("✅ Razorpay Order Created:", razorpayOrder.id);
    console.log("=================================");

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error) {
    console.log("=================================");
    console.log("❌ RAZORPAY CREATE ORDER ERROR");
    console.log("Message:", error.message);
    console.log("Description:", error?.error?.description);
    console.log("Full Error:", error);
    console.log("=================================");

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Failed to create Razorpay order",
    });
  }
});

// =====================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payment/verify
// =====================================================

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log("📩 Payment verification request");

    // ---------------------------------------------
    // VALIDATE PAYMENT DATA
    // ---------------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    // ---------------------------------------------
    // CREATE SIGNATURE
    // ---------------------------------------------

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // ---------------------------------------------
    // COMPARE SIGNATURE
    // ---------------------------------------------

    const isValid =
      generatedSignature === razorpay_signature;

    if (!isValid) {
      console.log("❌ Invalid Razorpay Signature");

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log(
      "✅ Razorpay Payment Verified:",
      razorpay_payment_id
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });
  } catch (error) {
    console.error(
      "❌ Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

module.exports = router;