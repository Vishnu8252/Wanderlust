const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");



module.exports.dashboard = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.render("admin/dashboard", {
        totalUsers,
        totalListings,
        totalReviews,
    });
};

module.exports.allUsers = async (req, res) => {
    const users = await User.find({});

    res.render("admin/users", { users });
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

   
    if (user.isAdmin) {
        req.flash("error", "Admin cannot be banned.");
        return res.redirect("/admin/users");
    }

    user.isBanned = !user.isBanned;

    await user.save();

    req.flash(
        "success",
        user.isBanned ? "User Banned Successfully" : "User Unbanned Successfully"
    );

    res.redirect("/admin/users");
};

module.exports.toggleBan = async (req, res) => {

    const { id } = req.params;

    const user = await User.findById(id);

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