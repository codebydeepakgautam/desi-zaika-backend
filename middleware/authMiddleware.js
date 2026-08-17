const jwt = require("jsonwebtoken");

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authMiddleware = (req, res, next) => {
  try {
    // =================================================
    // GET TOKEN FROM HEADER
    // =================================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Expected:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    // =================================================
    // VERIFY TOKEN
    // =================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =================================================
    // SAVE USER INFO IN REQUEST
    // =================================================

    req.user = {
      id: decoded.id,
    };

    // =================================================
    // NEXT
    // =================================================

    next();
  } catch (error) {
    console.error(
      "❌ AUTH MIDDLEWARE ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session.",
    });
  }
};

module.exports = authMiddleware;