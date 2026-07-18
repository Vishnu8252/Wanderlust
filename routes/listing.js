const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const {storage}=require("../cloudconfig.js")
const upload = multer({
    storage
});

const { listingSchema } = require("../schema.js");

const {
    isLoggedIn,
    isOwner,
} = require("../middleware.js");

const listingController = require("../controllers/listings");

// Validation Middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

// Index Route
router.get(
    "/",
    wrapAsync(listingController.index)
);
router.get(
    "/filter/:category",
    wrapAsync(listingController.filterCategory)
);
router.get("/search", wrapAsync(listingController.searchListings));
// New Route
router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);

// Create Route
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);

// Show Route
router.get(
    "/:id",
    
    wrapAsync(listingController.showListing)
);

// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

// Update Route
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
);

// Delete Route
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);

module.exports = router;