const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");



module.exports.dashboard = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalBookings = await Booking.countDocuments();
    res.render("admin/dashboard", {
        totalUsers,
        totalListings,
        totalReviews,
        totalBookings,
    });
};





module.exports.allUsers = async (req, res) => {

    let search = req.query.search || "";

    let users;

    if (search) {

        users = await User.find({
            username: {
                $regex: search,
                $options: "i",
            },
        });

    } else {

        users = await User.find({});

    }

    res.render("admin/users", {
        users,
        search,
    });

};





module.exports.toggleBan = async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/admin/users");
    }
    if (user.isAdmin) {
        req.flash("error", "Admin cannot be banned.");
        return res.redirect("/admin/users");
    }

    user.isBanned = !user.isBanned;

    await user.save();

    req.flash("success", user.isBanned ? "User Banned Successfully" : "User Unbanned Successfully");

    res.redirect("/admin/users");
};



module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/admin/users");
    }

    if (user.isAdmin) {
        req.flash("error", "Admin cannot be deleted!");
        return res.redirect("/admin/users");
    }

    await User.findByIdAndDelete(id);

    req.flash("success", "User deleted successfully!");

    return res.redirect("/admin/users");
};


module.exports.allListings = async (req, res) => {

    const search = req.query.search || "";

    const listings = await Listing.find({
        title: {
            $regex: search,
            $options: "i"
        }
    }).populate("owner");

    res.render("admin/listings", {
        listings,
        search
    });

};


module.exports.deleteListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/admin/listings");
}

await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted Successfully!");

    res.redirect("/admin/listings");
};
module.exports.editListingForm = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/admin/listings");
    }

    res.render("admin/editListing", { listing });
};



module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true, runValidators: true }
    );

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await listing.save();
    }

    req.flash("success", "Listing Updated Successfully!");

    res.redirect("/admin/listings");
};





module.exports.allReviews = async (req, res) => {

    const listings = await Listing.find({})
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });

    res.render("admin/reviews", { listings });
};

module.exports.deleteReview = async (req, res) => {

    const { id } = req.params;

    // Find the listing that contains this review
    const listing = await Listing.findOne({ reviews: id });

    if (listing) {
        await Listing.findByIdAndUpdate(listing._id, {
            $pull: { reviews: id }
        });
    }

    await Review.findByIdAndDelete(id);

    req.flash("success", "Review Deleted Successfully!");

    res.redirect("/admin/reviews");
};


module.exports.allBookings = async (req, res) => {
    try {

        const bookings = await Booking.find({})
            .populate("user")
            .populate("listing")
            .sort({ createdAt: -1 });


        res.render("admin/bookings", { bookings });

    } catch (err) {

        console.error("ALL BOOKINGS ERROR:");
        console.error(err);

        res.send(err.stack);
    }
};

module.exports.allPayments = async (req, res) => {

    try {

        const bookings = await Booking.find({})
            .populate("user")
            .populate("listing")
            .sort({ createdAt: -1 });

        res.render("admin/payments", {
            bookings,
        });

    } catch (err) {

        console.error(err.message);

        req.flash("error", "Unable to load payments.");

        res.redirect("/admin");

    }

};