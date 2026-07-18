const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

module.exports.createBooking = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    const { checkIn, checkOut, guests } = req.body;

    if (new Date(checkOut) <= new Date(checkIn)) {
        req.flash("error", "Check-out date must be after Check-in date.");
        return res.redirect("/listings/" + id);
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
        totalPrice
    });

    await booking.save();

    listing.bookings.push(booking._id);
    await listing.save();

    const user = await User.findById(req.user._id);
    user.bookings.push(booking._id);
    await user.save();

    req.flash("success", "Booking Created Successfully!");

    res.redirect("/listings/" + id);
};

module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");

    res.render("bookings/index.ejs", {
        bookings
    });
};

module.exports.cancelBooking = async (req, res) => {

    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }

    if (booking.status === "Cancelled") {
        req.flash("error", "Booking already cancelled.");
        return res.redirect("/bookings");
    }

    if (booking.paymentStatus !== "Paid") {
        req.flash("error", "Payment not found.");
        return res.redirect("/bookings");
    }

    try {

        const refund = await razorpay.payments.refund(
            booking.paymentId,
            {
                amount: booking.totalPrice * 100
            }
        );

        booking.status = "Cancelled";
        booking.paymentStatus = "Refunded";
        booking.refundStatus = "Refunded";
        booking.refundId = refund.id;

        await booking.save();

        req.flash(
            "success",
            "Booking cancelled and refund initiated successfully."
        );

        return res.redirect("/bookings");

    } catch (err) {

        console.log(err);

        req.flash(
            "error",
            err.error?.description || err.message
        );

        return res.redirect("/bookings");
    }
};

module.exports.createOrder = async (req, res) => {

    try {

        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Unable to create order"
        });
    }
};

module.exports.verifyPayment = async (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        listingId,
        checkIn,
        checkOut,
        guests
    } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Payment Verification Failed"
        });
    }

    const listing = await Listing.findById(listingId);

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
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentStatus: "Paid"
    });

    await booking.save();

    listing.bookings.push(booking._id);
    await listing.save();

    const user = await User.findById(req.user._id);
    user.bookings.push(booking._id);
    await user.save();

    res.json({
        success: true
    });
};