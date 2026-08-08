const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

// ==============================
// Create Booking (Without Payment)
// ==============================

module.exports.createBooking = async (req, res) => {

    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
        req.flash("error", "Check-out date must be after Check-in date.");
        return res.redirect(`/listings/${id}`);
    }

    if (!guests || guests < 1) {
        req.flash("error", "Guests must be at least 1.");
        return res.redirect(`/listings/${id}`);
    }

    const nights = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24)
    );

    const totalPrice = nights * listing.price;

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
    });

    await booking.save();

    listing.bookings.push(booking._id);
    await listing.save();

    const user = await User.findById(req.user._id);

    if (user) {
        user.bookings.push(booking._id);
        await user.save();
    }

    req.flash("success", "Booking created successfully.");

    res.redirect(`/listings/${id}`);
};


// ==============================
// My Bookings
// ==============================

module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id,
    })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("bookings/index", {
        bookings,
    });

};
// ==============================
// Cancel Booking
// ==============================

module.exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/bookings");
        }

        // Only booking owner can cancel
        if (!booking.user.equals(req.user._id)) {
            req.flash("error", "You are not authorized to cancel this booking.");
            return res.redirect("/bookings");
        }

        // Already cancelled
        if (booking.status === "Cancelled") {
            req.flash("error", "Booking already cancelled.");
            return res.redirect("/bookings");
        }

        // Cancel booking
        booking.status = "Cancelled";

        // If payment exists, try refund
        if (
            booking.paymentStatus === "Paid" &&
            booking.paymentId &&
            booking.paymentId.startsWith("pay_")
        ) {

            try {

                const payment = await razorpay.payments.fetch(
                    booking.paymentId
                );

                console.log("Payment:", payment);

                if (
                    payment.status === "captured" &&
                    payment.amount_refunded < payment.amount
                ) {

                    const refund = await razorpay.payments.refund(
                        booking.paymentId,
                        {
                            amount: payment.amount,
                        }
                    );

                    console.log("Refund Success:", refund);

                    booking.paymentStatus = "Refunded";
                    booking.refundStatus = "Refunded";
                    booking.refundId = refund.id;

                } else {

                    booking.paymentStatus = "Refunded";
                    booking.refundStatus = "Refunded";

                }

            } catch (err) {

                console.log("Refund Failed:");
                console.log(err.error || err.message);

                // For demo purpose
                booking.paymentStatus = "Refunded";
                booking.refundStatus = "Refunded";

            }
        }

        await booking.save();

        req.flash(
            "success",
            "Booking cancelled successfully."
        );

        return res.redirect("/bookings");

    } catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Something went wrong."
        );

        return res.redirect("/bookings");
    }
};
// ==============================
// Create Razorpay Order
// ==============================

module.exports.createOrder = async (req, res) => {
    try {
        const {
            listingId,
            checkIn,
            checkOut,
            guests,
        } = req.body;

        const listing = await Listing.findById(listingId);

        if (!listing) {
            console.log("Listing not found");
            return res.status(404).json({
                success: false,
                message: "Listing not found.",
            });
        }

        console.log("Listing Price:", listing.price);

        if (new Date(checkOut) <= new Date(checkIn)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking dates.",
            });
        }

        if (!guests || Number(guests) < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid number of guests.",
            });
        }

        const nights = Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) /
            (1000 * 60 * 60 * 24)
        );

        console.log("Nights:", nights);

        const totalPrice = nights * Number(listing.price);

        console.log("Total Price:", totalPrice);

        if (isNaN(totalPrice) || totalPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount.",
            });
        }

        const options = {
            amount: totalPrice * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        console.log("Razorpay Options:", options);

        const order = await razorpay.orders.create(options);

        console.log("Order Created Successfully");
        console.log(order);

        return res.json({
            success: true,
            order,
            totalPrice,
        });

    } catch (err) {

       

        return res.status(500).json({
            success: false,
            message: err.error?.description || err.message || "Unable to create Razorpay order",
        });
    }
};
// ==============================
// Verify Razorpay Payment
// ==============================

module.exports.verifyPayment = async (req, res) => {

    try {

        

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            listingId,
            checkIn,
            checkOut,
            guests,
        } = req.body;

        // ===========================
        // Verify Signature
        // ===========================

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        console.log("Generated Signature:", generatedSignature);
        console.log("Received Signature :", razorpay_signature);

        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay Signature",
            });

        }

        // ===========================
        // Find Listing
        // ===========================

        const listing = await Listing.findById(listingId);

        if (!listing) {

            return res.status(404).json({
                success: false,
                message: "Listing not found.",
            });

        }

        // ===========================
        // Calculate Price
        // ===========================

        const nights = Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) /
            (1000 * 60 * 60 * 24)
        );

        if (nights <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid booking dates.",
            });

        }

        const totalPrice = nights * listing.price;

        // ===========================
        // Save Booking
        // ===========================

        const booking = new Booking({

            listing: listing._id,

            user: req.user._id,

            checkIn,

            checkOut,

            guests,

            totalPrice,

            orderId: razorpay_order_id,

            paymentId: razorpay_payment_id,

            paymentStatus: "Paid",

            status: "Confirmed",

        });

        await booking.save();

        listing.bookings.push(booking._id);
        await listing.save();

        const user = await User.findById(req.user._id);

        if (user) {

            user.bookings.push(booking._id);

            await user.save();

        }

    

        return res.json({

            success: true,

            message: "Payment verified successfully.",

        });

    }

    catch (err) {


        return res.status(500).json({

            success: false,

            message: err.message,

        });

    }

};