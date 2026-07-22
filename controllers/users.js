const User = require("../models/user");
const Listing = require("../models/listing");

// ==============================
// Render Signup Form
// ==============================

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};


// ==============================
// Signup
// ==============================

module.exports.signup = async (req, res, next) => {

    try {

        const { username, email, password } = req.body;

        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
        });
        const registeredUser = await User.register(
            newUser,
            password
        );

        req.login(registeredUser, (err) => {

            if (err) return next(err);

            req.flash(
                "success",
                "Welcome to Wanderlust!"
            );

            res.redirect("/listings");

        });

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/signup");

    }

};


// ==============================
// Render Login Form
// ==============================

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};


// ==============================
// Login
// ==============================

module.exports.login = (req, res) => {

    if (req.user.isAdmin) {

        req.flash("success", "Welcome Admin!");

        return res.redirect("/admin");

    }

    req.flash("success", "Welcome back!");

    const redirectUrl =
        res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);

};


// ==============================
// Logout
// ==============================

module.exports.logout = (req, res, next) => {

    req.logout((err) => {

        if (err) return next(err);

        req.flash(
            "success",
            "Logged out successfully."
        );

        res.redirect("/listings");

    });

};
// ==============================
// Show Profile
// ==============================

module.exports.showProfile = async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    res.render("users/profile", {
        user,
    });

};


// ==============================
// Render Edit Profile Form
// ==============================

module.exports.editProfileForm = async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    res.render("users/editProfile", {
        user,
    });

};


// ==============================
// Update Profile
// ==============================

module.exports.updateProfile = async (req, res) => {

    const { bio, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    user.bio = bio?.trim() || "";
    user.phone = phone?.trim() || "";

    if (req.file) {

        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename,
        };

    }

    await user.save();

    req.flash(
        "success",
        "Profile updated successfully."
    );

    res.redirect("/profile");

};


// ==============================
// Toggle Wishlist
// ==============================

module.exports.toggleWishlist = async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    const exists = user.wishlist.some(
        (item) => item.toString() === id
    );

    if (exists) {

        user.wishlist.pull(id);

        req.flash(
            "success",
            "Removed from wishlist."
        );

    } else {

        user.wishlist.push(id);

        req.flash(
            "success",
            "Added to wishlist."
        );

    }

    await user.save();

    res.redirect(`/listings/${id}`);

};


// ==============================
// Show Wishlist
// ==============================

module.exports.showWishlist = async (req, res) => {

    const user = await User.findById(req.user._id)
        .populate("wishlist");

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    res.render("users/wishlist", {
        user,
    });

};