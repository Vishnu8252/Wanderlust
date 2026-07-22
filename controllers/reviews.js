const Listing = require("../models/listing");
const Review = require("../models/review");

// ==============================
// Create Review
// ==============================

module.exports.createReview = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    await newReview.save();

    listing.reviews.push(newReview);

    await listing.save();

    req.flash("success", "Review added successfully.");

    res.redirect(`/listings/${id}`);
};


// ==============================
// Delete Review
// ==============================

module.exports.destroyReview = async (req, res) => {

    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId,
        },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully.");

    res.redirect(`/listings/${id}`);
};