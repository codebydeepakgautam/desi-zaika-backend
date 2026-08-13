const express = require("express");
const router = express.Router();

const Review = require("../models/Review");

// =====================================================
// GET ALL REVIEWS
// GET /api/reviews
// =====================================================

router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({
        createdAt: -1,
      });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => {
          return sum + Number(review.rating || 0);
        },
        0
      );

      averageRating = Number(
        (totalRating / reviews.length).toFixed(1)
      );
    }

    res.status(200).json({
      success: true,
      reviews,
      totalReviews: reviews.length,
      averageRating,
    });
  } catch (error) {
    console.error(
      "❌ Get All Reviews Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
});

// =====================================================
// GET REVIEWS BY FOOD ID
// GET /api/reviews/7
// =====================================================

router.get("/:foodId", async (req, res) => {
  try {
    const foodId = Number(req.params.foodId);

    if (Number.isNaN(foodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID",
      });
    }

    const reviews = await Review.find({
      foodId: foodId,
    }).sort({
      createdAt: -1,
    });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => {
          return sum + Number(review.rating || 0);
        },
        0
      );

      averageRating = Number(
        (totalRating / reviews.length).toFixed(1)
      );
    }

    res.status(200).json({
      success: true,
      reviews,
      totalReviews: reviews.length,
      averageRating,
    });
  } catch (error) {
    console.error(
      "❌ Get Reviews Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
});

// =====================================================
// ADD REVIEW
// POST /api/reviews
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      foodId,
      foodName,
      userId,
      userName,
      rating,
      comment,
      orderId,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      foodId === undefined ||
      !foodName ||
      !userId ||
      !userName ||
      rating === undefined ||
      !comment ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "All review fields are required",
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =================================================
    // CHECK DUPLICATE REVIEW
    // =================================================

    const existingReview =
      await Review.findOne({
        foodId: Number(foodId),
        userId: String(userId),
        orderId: String(orderId),
      });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this food for this order.",
      });
    }

    // =================================================
    // CREATE REVIEW
    // =================================================

    const review = await Review.create({
      foodId: Number(foodId),
      foodName: foodName.trim(),
      userId: String(userId),
      userName: userName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      orderId: String(orderId),
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error(
      "❌ Add Review Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE REVIEW
// DELETE /api/reviews/:reviewId
// =====================================================

router.delete("/:reviewId", async (req, res) => {
  try {
    const review =
      await Review.findById(
        req.params.reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(
      req.params.reviewId
    );

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete Review Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
});

module.exports = router;