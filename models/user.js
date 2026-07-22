const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema(
{
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    isAdmin: {
        type: Boolean,
        default: false,
    },

    isBanned: {
        type: Boolean,
        default: false,
    },

    profileImage: {
        url: {
            type: String,
            default:
                "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
        },
        filename: {
            type: String,
            default: "",
        },
    },

    bio: {
        type: String,
        default: "",
        trim: true,
    },

    phone: {
        type: String,
        default: "",
        trim: true,
    },

    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },
    ],

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

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);