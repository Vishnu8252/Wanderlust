const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
{
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    checkIn: {
        type: Date,
        required: true,
    },

    checkOut: {
        type: Date,
        required: true,
    },

    guests: {
        type: Number,
        default: 1,
    },

    totalPrice: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    paymentId: String,

orderId: String,

paymentStatus: {
    type: String,
    default: "Pending"
},
refundId: String,
refundStatus: {
    type: String,
    default: "Not Refunded"
}
});

module.exports = mongoose.model("Booking", bookingSchema);