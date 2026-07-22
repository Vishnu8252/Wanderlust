const mongoose = require("mongoose");
const { Schema } = mongoose;

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
        required: true,
        min: 1,
        default: 1,
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },

    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed",
    },

    paymentId: {
        type: String,
        default: "",
    },

    orderId: {
        type: String,
        default: "",
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
    },

    refundId: {
        type: String,
        default: "",
    },

    refundStatus: {
        type: String,
        enum: ["Not Refunded", "Refunded"],
        default: "Not Refunded",
    },
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Booking", bookingSchema);