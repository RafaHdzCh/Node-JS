const express = require("express");
viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/",authController.IsLoggedIn, viewsController.GetOverview);
router.get("/tour/:slug", authController.IsLoggedIn, viewsController.GetTour);
router.get("/login", authController.IsLoggedIn, viewsController.GetLoginForm);
router.get("/me",authController.Protect ,viewsController.GetAccount);

router.post("/submit-user-data", authController.Protect, viewsController.UpdateUserData)

module.exports = router;