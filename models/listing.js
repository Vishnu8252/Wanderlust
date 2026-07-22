const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

const listingSchema = new Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    image: {
        url: {
            type: String,
            default: "",
        },
        filename: {
            type: String,
            default: "",
        },
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    location: {
        type: String,
        required: true,
        trim: true,
    },

    country: {
        type: String,
        required: true,
        trim: true,
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) => arr.length === 2,
                message: "Coordinates must contain longitude and latitude.",
            },
        },
    },

    category: {
        type: String,
        enum: [
            "trending",
            "rooms",
            "iconic-cities",
            "mountains",
            "beachfront",
            "camping",
            "castles",
            "amazing-pools",
            "lakefront",
            "cabins",
            "tropical",
            "arctic",
            "farms",
            "luxe",
            "pet-friendly",
        ],
        default: "trending",
    },

    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        },
    ],
},
{
    timestamps: true,
}
);

listingSchema.index({ geometry: "2dsphere" });

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews },
        });
    }
});

module.exports = mongoose.model("Listing", listingSchema);