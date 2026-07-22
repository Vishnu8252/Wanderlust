const express = require("express");
const router = express.Router();

const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");

const { saveRedirectUrl,isLoggedIn } = require("../middleware");

const userController = require("../controllers/users");
const multer = require("multer");
const { storage } = require("../cloudconfig");
const upload = multer({ storage });

// Signup
router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// Login
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// Logout
router.get(
    "/logout",
    isLoggedIn,
    userController.logout
);
router.get(
    "/profile",
    isLoggedIn,
    userController.showProfile
);

router.get(
    "/profile/edit",
    isLoggedIn,
    userController.editProfileForm
);

router.put(
    "/profile",
    isLoggedIn,
    upload.single("profileImage"),
    userController.updateProfile
);

router.post(
    "/wishlist/:id",
    isLoggedIn,
    userController.toggleWishlist
);

router.get(
    "/wishlist",
    isLoggedIn,
    userController.showWishlist
);

module.exports = router;