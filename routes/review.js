const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../schema");
const {
    isLoggedIn,
    isReviewAuthor,
} = require("../middleware");

const reviewController = require("../controllers/reviews");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

// Create Review
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete Review
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;