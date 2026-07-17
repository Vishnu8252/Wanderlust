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