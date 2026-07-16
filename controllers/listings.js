const Listing = require("../models/listing.js");
const axios = require("axios");

// Index Route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings,selectedCategory:"trending" ,});
};

// Render New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show Listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Create Listing
module.exports.createListing = async (req, res) => {
    const url = req.file.path;
const filename = req.file.filename;
console.log(url,filename);
    const newListing = new Listing(req.body.listing);
    const location = `${req.body.listing.location}, ${req.body.listing.country}`;

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
    console.log(response.data);
    newListing.geometry = {
        type: "Point",
        coordinates: [
            parseFloat(response.data[0].lon),
            parseFloat(response.data[0].lat),
        ],
    };
}

    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename,
        };
    }
    newListing.image = { url, filename };
    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

// Render Edit Form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("upload","upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

// Update Listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

   let listing= await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
    });
    if( typeof req.file!== "undefined"){
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete Listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
// Filter by Category
module.exports.filterCategory = async (req, res) => {
    const { category } = req.params;

    const allListings = await Listing.find({ category });

    res.render("listings/index.ejs", { allListings,selectedCategory:"category" ,});
};
module.exports.searchListings = async (req, res) => {
    const { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
        ],
    });

    res.render("listings/index.ejs", {
        allListings,
        selectedCategory: "trending",
    });
};