const express = require("express");
const router = express.Router({ mergeParams: true });

const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");
router.get(
    "/",
    isLoggedIn,
    bookingController.myBookings
);
router.post(
    "/",
    isLoggedIn,
    bookingController.createBooking
);

router.delete(
    "/:id",
    isLoggedIn,
    bookingController.cancelBooking
);

router.post(
    "/create-order",
    isLoggedIn,
    bookingController.createOrder
);

router.post(
    "/verify-payment",
    isLoggedIn,
    bookingController.verifyPayment
);

module.exports = router;