const authController = require("./../controllers/authController");
const reviewController = require("./../controllers/reviewController");
const express = require("express");

const router = express.Router({mergeParams: true});

router.use(authController.Protect);

router
  .route("/")
    .get(reviewController.GetAllReviews)
    .post(authController.RestrictTo("user"), 
          reviewController.SetTourUserIDs,
          reviewController.CreateReview);

router.use(authController.RestrictTo("user","admin"));

router.route("/:id")
    .get(reviewController.GetReviewByID)
    .patch(authController.RestrictTo("user","admin"), 
           reviewController.UpdateReviewByID)
    .delete(authController.RestrictTo("user","admin"), 
            reviewController.DeleteReviewByID);

module.exports = router;