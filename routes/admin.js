const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.");
const upload = multer({ storage });
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync.js");
const adminController = require("../controllers/admin");
const { isLoggedIn, isAdmin } = require("../middleware");

router.get(
    "/",
    isLoggedIn,
    isAdmin,
    adminController.dashboard
);
router.get(
    "/users",
    isLoggedIn,
    isAdmin,
    adminController.allUsers
);


router.put(
    "/users/:id/ban",
    isLoggedIn,
    isAdmin,
    adminController.toggleBan
);


router.delete(
    "/users/:id",
    isLoggedIn,
    isAdmin,
    adminController.deleteUser
);

router.get(
    "/listings",
    isLoggedIn,
    isAdmin,
    adminController.allListings
);

router.delete(
    "/listings/:id",
    isLoggedIn,
    isAdmin,
    adminController.deleteListing
);
router.get(
    "/listings/:id/edit",
    isLoggedIn,
    isAdmin,
    adminController.editListingForm
);

router.put(
    "/listings/:id",
    isLoggedIn,
    isAdmin,
    upload.single("listing[image]"),
    adminController.updateListing
);


router.get(
    "/reviews",
    isLoggedIn,
    isAdmin,
    adminController.allReviews
);

router.delete(
    "/reviews/:id",
    isLoggedIn,
    isAdmin,
    adminController.deleteReview
);

router.get(
    "/bookings",
    isLoggedIn,
    isAdmin,
    adminController.allBookings
);
router.get(
    "/payments",
    isLoggedIn,
    isAdmin,
    wrapAsync(adminController.allPayments)
);



module.exports = router;