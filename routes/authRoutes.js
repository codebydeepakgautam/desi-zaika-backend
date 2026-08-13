const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();

// =====================================================
// AUTH TEST
// =====================================================

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes working ✅",
  });
});

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =====================================================
// EMAIL TEST
// =====================================================

transporter.verify((error) => {
  if (error) {
    console.error(
      "❌ Email configuration error:",
      error.message
    );
  } else {
    console.log("✅ Email service ready");
  }
});

// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {
  console.log("📝 Register request received");

  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // -------------------------------
    // EMAIL VALIDATION
    // -------------------------------

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    // -------------------------------
    // PHONE VALIDATION
    // -------------------------------

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit mobile number.",
      });
    }

    // -------------------------------
    // PASSWORD VALIDATION
    // -------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    // -------------------------------
    // CHECK EXISTING USER
    // -------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email.",
      });
    }

    // -------------------------------
    // HASH PASSWORD
    // -------------------------------

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // -------------------------------
    // CREATE USER
    // -------------------------------

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null,
    });

    console.log(
      "✅ User registered:",
      user.email
    );

    // -------------------------------
    // RESPONSE
    // -------------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "❌ Register Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  console.log("🔐 Login request received");

  try {
    const {
      email,
      password,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    // -------------------------------
    // FIND USER
    // -------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email.",
      });
    }

    // -------------------------------
    // CHECK PASSWORD
    // -------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    console.log(
      "✅ Login successful:",
      user.email
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "❌ Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
});

// =====================================================
// FORGOT PASSWORD
// SEND OTP
// =====================================================

router.post(
  "/forgot-password",
  async (req, res) => {
    console.log(
      "📩 Forgot password request received"
    );

    try {
      const { email } = req.body;

      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      console.log(
        "🔎 Searching email:",
        cleanEmail
      );

      // -------------------------------
      // FIND USER
      // -------------------------------

      const user = await User.findOne({
        email: cleanEmail,
      });

      if (!user) {
        console.log(
          "❌ No account found:",
          cleanEmail
        );

        return res.status(404).json({
          success: false,
          message:
            "No account found with this email.",
        });
      }

      console.log(
        "✅ User found:",
        user.email
      );

      // -------------------------------
      // GENERATE OTP
      // -------------------------------

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

      const otpExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      // -------------------------------
      // SAVE OTP
      // -------------------------------

      user.resetOtp = otp;
      user.resetOtpExpires =
        otpExpires;

      await user.save();

      console.log(
        "🔐 OTP generated:",
        otp
      );

      // -------------------------------
      // SEND EMAIL
      // -------------------------------

      await transporter.sendMail({
        from: `"Desi Zaika" <${process.env.EMAIL_USER}>`,

        to: cleanEmail,

        subject:
          "Desi Zaika - Password Reset OTP",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 30px auto;
            background: #f3f4f6;
            padding: 30px;
          ">

            <div style="
              background: #ea580c;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 15px 15px 0 0;
            ">

              <h1 style="margin: 0;">
                Desi Zaika 🍽️
              </h1>

              <p>
                Password Reset
              </p>

            </div>

            <div style="
              background: white;
              padding: 35px;
              border-radius: 0 0 15px 15px;
            ">

              <h2>
                Password Reset OTP
              </h2>

              <p>
                We received a request to reset
                your Desi Zaika account password.
              </p>

              <p>
                Your verification OTP is:
              </p>

              <div style="
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 10px;
                text-align: center;
                background: #fff7ed;
                color: #ea580c;
                padding: 22px;
                border-radius: 12px;
                margin: 30px 0;
              ">
                ${otp}
              </div>

              <p>
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p style="
                color: #6b7280;
                margin-top: 25px;
              ">
                If you did not request a password
                reset, you can safely ignore this email.
              </p>

              <hr style="
                margin: 30px 0;
                border: none;
                border-top: 1px solid #e5e7eb;
              ">

              <p style="
                color: #9ca3af;
                font-size: 13px;
                text-align: center;
              ">
                © ${new Date().getFullYear()}
                Desi Zaika. All rights reserved.
              </p>

            </div>

          </div>
        `,
      });

      console.log(
        "📧 OTP email sent successfully"
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP sent successfully to your email.",
      });
    } catch (error) {
      console.error(
        "❌ Forgot Password Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP.",
      });
    }
  }
);

// =====================================================
// VERIFY OTP
// =====================================================

router.post(
  "/verify-otp",
  async (req, res) => {
    console.log(
      "🔐 Verify OTP request received"
    );

    try {
      const {
        email,
        otp,
      } = req.body;

      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message:
            "Email and OTP are required.",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanOtp =
        otp.toString().trim();

      // -------------------------------
      // FIND USER
      // -------------------------------

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // -------------------------------
      // CHECK OTP
      // -------------------------------

      if (
        !user.resetOtp ||
        user.resetOtp !== cleanOtp
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP.",
        });
      }

      // -------------------------------
      // CHECK EXPIRY
      // -------------------------------

      if (
        !user.resetOtpExpires ||
        user.resetOtpExpires < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        });
      }

      console.log(
        "✅ OTP verified:",
        cleanEmail
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP verified successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Verify OTP Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify OTP.",
      });
    }
  }
);

// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
  "/reset-password",
  async (req, res) => {
    console.log(
      "🔑 Reset password request received"
    );

    try {
      const {
        email,
        otp,
        password,
      } = req.body;

      // -------------------------------
      // VALIDATION
      // -------------------------------

      if (
        !email ||
        !otp ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email, OTP and password are required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      const cleanEmail =
        email.trim().toLowerCase();

      const cleanOtp =
        otp.toString().trim();

      // -------------------------------
      // FIND USER
      // -------------------------------

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // -------------------------------
      // CHECK OTP
      // -------------------------------

      if (
        !user.resetOtp ||
        user.resetOtp !== cleanOtp
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP.",
        });
      }

      // -------------------------------
      // CHECK EXPIRY
      // -------------------------------

      if (
        !user.resetOtpExpires ||
        user.resetOtpExpires < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired.",
        });
      }

      // -------------------------------
      // HASH PASSWORD
      // -------------------------------

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // -------------------------------
      // UPDATE PASSWORD
      // -------------------------------

      user.password =
        hashedPassword;

      // Clear OTP
      user.resetOtp = null;
      user.resetOtpExpires = null;

      await user.save();

      console.log(
        "✅ Password reset successfully:",
        cleanEmail
      );

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Reset Password Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password.",
      });
    }
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;