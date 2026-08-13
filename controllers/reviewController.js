const Review = require("../models/Review");

// =====================================================
// CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
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

    // =================================================
    // RATING VALIDATION
    // =================================================

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // =================================================
    // COMMENT VALIDATION
    // =================================================

    const cleanComment = comment.trim();

    if (!cleanComment) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty",
      });
    }

    if (cleanComment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 500 characters",
      });
    }

    // =================================================
    // CHECK DUPLICATE REVIEW
    // =================================================

    const existingReview = await Review.findOne({
      foodId,
      userId,
      orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this food",
      });
    }

    // =================================================
    // CREATE REVIEW
    // =================================================

    const review = await Review.create({
      foodId,
      foodName: foodName.trim(),
      userId,
      userName: userName.trim(),
      rating: numericRating,
      comment: cleanComment,
      orderId,
    });

    // =================================================
    // GET ALL REVIEWS FOR FOOD
    // =================================================

    const reviews = await Review.find({
      foodId,
    });

    // =================================================
    // CALCULATE AVERAGE RATING
    // =================================================

    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number(
            (totalRating / totalReviews).toFixed(1)
          )
        : 0;

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      success: true,

      message: "Review submitted successfully",

      review,

      rating: {
        average: averageRating,
        totalReviews,
      },
    });
  } catch (error) {
    console.error(
      "Create Review Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// =====================================================
// GET REVIEWS BY FOOD
// =====================================================

const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;

    // =================================================
    // GET REVIEWS
    // =================================================

    const reviews = await Review.find({
      foodId,
    }).sort({
      createdAt: -1,
    });

    // =================================================
    // CALCULATE AVERAGE
    // =================================================

    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number(
            (totalRating / totalReviews).toFixed(1)
          )
        : 0;

    // =================================================
    // RATING BREAKDOWN
    // =================================================

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      ratingBreakdown[review.rating]++;
    });

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      foodId,

      rating: {
        average: averageRating,
        totalReviews,
      },

      ratingBreakdown,

      reviews,
    });
  } catch (error) {
    console.error(
      "Get Food Reviews Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // FIND REVIEW
    // =================================================

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // =================================================
    // DELETE
    // =================================================

    await Review.findByIdAndDelete(id);

    // =================================================
    // RECALCULATE RATING
    // =================================================

    const reviews = await Review.find({
      foodId: review.foodId,
    });

    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number(
            (totalRating / totalReviews).toFixed(1)
          )
        : 0;

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      message: "Review deleted successfully",

      rating: {
        average: averageRating,
        totalReviews,
      },
    });
  } catch (error) {
    console.error(
      "Delete Review Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReview,
  getFoodReviews,
  deleteReview,
};