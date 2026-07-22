const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const bookingController = require("../controllers/bookings");
const { isLoggedIn } = require("../middleware");

// ===============================
// Booking Form
// ===============================
router.get(
    "/:listingId/book",
    isLoggedIn,
    wrapAsync(bookingController.renderBookingForm)
);

// ===============================
// Create Razorpay Order
// ===============================
router.post(
    "/create-order",
    isLoggedIn,
    wrapAsync(bookingController.createOrder)
);

// ===============================
// Verify Payment
// ===============================
router.post(
    "/verify-payment",
    isLoggedIn,
    wrapAsync(bookingController.verifyPayment)
);
// ===============================
// User Bookings
// Supports both:
// /bookings
// /bookings/my
// ===============================
router.get(
    "/",
    isLoggedIn,
    wrapAsync(bookingController.myBookings)
);

router.get(
    "/my",
    isLoggedIn,
    wrapAsync(bookingController.myBookings)
);

// ===============================
// Cancel Booking
// ===============================
router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;