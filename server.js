const dns = require("dns");

// =====================================================
// MONGODB DNS FIX
// =====================================================

dns.setDefaultResultOrder("ipv4first");

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

require("dotenv").config();

// =====================================================
// IMPORTS
// =====================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// =====================================================
// ROUTES
// =====================================================

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const shopRoutes = require("./routes/shopRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// REQUEST LOGGER
// =====================================================

app.use((req, res, next) => {
  console.log(
    `➡️ ${req.method} ${req.originalUrl}`
  );

  next();
});

// =====================================================
// ROOT TEST
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Desi Zaika Backend Running 🚀",
  });
});

// =====================================================
// ORDER ROUTES
// =====================================================

app.use("/api/orders", orderRoutes);

console.log("✅ Order routes loaded");

// =====================================================
// PAYMENT ROUTES
// =====================================================

app.use("/api/payment", paymentRoutes);

console.log("✅ Payment routes loaded");

// =====================================================
// PAYMENT TEST ROUTE
// =====================================================

app.post("/api/payment/test", (req, res) => {
  console.log("🔥 PAYMENT TEST HIT");

  console.log("Body:", req.body);

  res.status(200).json({
    success: true,
    message: "Payment route is working ✅",
    body: req.body,
  });
});

// =====================================================
// CONTACT ROUTES
// =====================================================

app.use("/api/contact", contactRoutes);

console.log("✅ Contact routes loaded");

// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

console.log("✅ Auth routes loaded");

// =====================================================
// REVIEW ROUTES
// =====================================================

app.use("/api/reviews", reviewRoutes);

console.log("✅ Review routes loaded");

// =====================================================
// SHOP ROUTES
// =====================================================

app.use("/api/shop", shopRoutes);

console.log("✅ Shop routes loaded");

// =====================================================
// AUTH TEST
// =====================================================

app.get("/api/auth-check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth check working ✅",
  });
});

// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
  console.log(
    `❌ 404: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error(
    "❌ Server Error:",
    error
  );

  res.status(500).json({
    success: false,
    message:
      error?.message ||
      "Internal server error",
  });
});

// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log(
      "MongoDB Connected ✅"
    );

    // =================================================
    // START SERVER
    // =================================================

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} 🚀`
      );

      console.log(
        "Razorpay Key Loaded:",
        Boolean(
          process.env.RAZORPAY_KEY_ID
        )
      );

      console.log(
        "Razorpay Secret Loaded:",
        Boolean(
          process.env.RAZORPAY_KEY_SECRET
        )
      );

      console.log(
        "Review API:",
        `http://localhost:${PORT}/api/reviews`
      );

      console.log(
        "Shop API:",
        `http://localhost:${PORT}/api/shop`
      );

      console.log(
        "Shop Toggle API:",
        `http://localhost:${PORT}/api/shop/toggle`
      );
    });
  })

  .catch((error) => {
    console.error(
      "❌ MongoDB Error:",
      error.message
    );
  });