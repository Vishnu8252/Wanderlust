const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const { isLoggedIn, isAdmin } = require("../middleware");

router.get(
    "/",
    isLoggedIn,
    isAdmin,
    adminController.dashboard
);
router.get(
    "/users",
    isLoggedIn,
    isAdmin,
    adminController.allUsers
);

router.get(
    "/users",
    isLoggedIn,
    isAdmin,
    adminController.allUsers
);

router.put(
    "/users/:id/ban",
    isLoggedIn,
    isAdmin,
    adminController.toggleBan
);

router.put(
    "/users/:id/ban",
    isLoggedIn,
    isAdmin,
    adminController.toggleBan
);
router.delete(
    "/users/:id",
    isLoggedIn,
    isAdmin,
    adminController.deleteUser
);

module.exports = router;