const User = require("../models/user.js");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// Signup
module.exports.signup = async (req, res, next) => {
    let { username, email, password } = req.body;

    const newUser = new User({
        email,
        username,
    });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    });
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// Login
module.exports.login = async (req, res) => {
    if (req.user.isAdmin) {
        req.flash("success", "Welcome Admin!");
        return res.redirect("/admin");
    }
    req.flash("success", "Welcome back!");

    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
};
module.exports.showProfile = async (req, res) => {

    const user = await User.findById(req.user._id);

    res.render("users/profile", { user });

};
module.exports.editProfileForm = async (req, res) => {

    const user = await User.findById(req.user._id);

    res.render("users/editProfile", { user });

};

module.exports.updateProfile = async (req, res) => {

    const { bio, phone } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
        bio,
        phone
    });

    req.flash("success", "Profile Updated Successfully!");

    res.redirect("/profile");

};

module.exports.updateProfile = async (req, res) => {

    const { bio, phone } = req.body;

    const user = await User.findById(req.user._id);

    user.bio = bio;
    user.phone = phone;

    if (req.file) {
        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await user.save();

    req.flash("success", "Profile Updated Successfully!");

    res.redirect("/profile");
};

module.exports.toggleWishlist = async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.includes(id);

    if (exists) {

        user.wishlist.pull(id);

        req.flash("success", "Removed from Wishlist");

    } else {

        user.wishlist.push(id);

        req.flash("success", "Added to Wishlist");

    }

    await user.save();

    res.redirect(`/listings/${id}`);

};

module.exports.showWishlist = async (req, res) => {

    const user = await User.findById(req.user._id)
        .populate("wishlist");

    res.render("users/wishlist", { user });

};