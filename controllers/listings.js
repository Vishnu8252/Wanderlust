const Listing = require("../models/listing");
const User = require("../models/user");
const Booking = require("../models/booking");
const axios = require("axios");

// ==============================
// Show All Listings
// ==============================

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});

    res.render("listings/index", {
        allListings,
        selectedCategory: "trending",
    });
};

// ==============================
// Render New Listing Form
// ==============================

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// ==============================
// Show Single Listing
// ==============================

module.exports.showListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist.");
        return res.redirect("/listings");
    }

    let isWishlisted = false;

    if (req.user) {
        const user = await User.findById(req.user._id)
            .select("wishlist");

        if (user) {
            isWishlisted = user.wishlist.some(
                (item) => item.toString() === listing._id.toString()
            );
        }
    }

    const bookings = await Booking.find({
        listing: listing._id,
        status: "Confirmed",
    });

    res.render("listings/show", {
        listing,
        bookings,
        isWishlisted,
    });
};


// ==============================
// Create Listing
// ==============================

module.exports.createListing = async (req, res) => {

    if (!req.file) {
        req.flash("error", "Please upload a listing image.");
        return res.redirect("/listings/new");
    }

    const { path: url, filename } = req.file;

    const newListing = new Listing(req.body.listing);

    // Owner
    newListing.owner = req.user._id;

    // Image
    newListing.image = {
        url,
        filename,
    };

    // Geocoding
    const location = `${req.body.listing.location}, ${req.body.listing.country}`;

    try {

        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: location,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": "WanderlustApp/1.0",
                },
            }
        );

        if (response.data.length > 0) {

            newListing.geometry = {
                type: "Point",
                coordinates: [
                    parseFloat(response.data[0].lon),
                    parseFloat(response.data[0].lat),
                ],
            };

        } else {

            req.flash("error", "Unable to find the location.");
            return res.redirect("/listings/new");

        }

    } catch (err) {

        console.log(err);

        req.flash("error", "Location service is temporarily unavailable.");
        return res.redirect("/listings/new");

    }

    await newListing.save();

    req.flash("success", "New Listing Created Successfully!");

    res.redirect(`/listings/${newListing._id}`);
};


// ==============================
// Render Edit Form
// ==============================

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist.");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    if (originalImageUrl.includes("cloudinary")) {
        originalImageUrl = originalImageUrl.replace(
            "/upload",
            "/upload/h_300,w_250"
        );
    }

    res.render("listings/edit", {
        listing,
        originalImageUrl,
    });

};


// ==============================
// Update Listing
// ==============================

module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (req.file) {

        const { path: url, filename } = req.file;

        listing.image = {
            url,
            filename,
        };

        await listing.save();
    }

    req.flash("success", "Listing Updated Successfully!");

    res.redirect(`/listings/${id}`);

};

// ==============================
// Delete Listing
// ==============================

module.exports.destroyListing = async (req, res) => {

    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted Successfully!");

    res.redirect("/listings");
};


// ==============================
// Filter Listings by Category
// ==============================

module.exports.filterCategory = async (req, res) => {

    const { category } = req.params;

    const allListings = await Listing.find({
        category: category,
    });

    res.render("listings/index", {
        allListings,
        selectedCategory: category,
    });

};


// ==============================
// Search Listings
// ==============================

module.exports.searchListings = async (req, res) => {

    const q = req.query.q?.trim();

    if (!q) {
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            {
                title: {
                    $regex: q,
                    $options: "i",
                },
            },
            {
                location: {
                    $regex: q,
                    $options: "i",
                },
            },
            {
                country: {
                    $regex: q,
                    $options: "i",
                },
            },
            {
                category: {
                    $regex: q,
                    $options: "i",
                },
            },
        ],
    });

    if (allListings.length === 0) {
        req.flash("error", "No listings found.");
    }

    res.render("listings/index", {
        allListings,
        selectedCategory: "trending",
    });

};