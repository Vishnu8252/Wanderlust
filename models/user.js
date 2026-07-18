const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
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
            default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
        },
        filename: {
            type: String,
            default: ""
        }
    },

    bio: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        default: ""
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        }
    ],
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        }
    ],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);