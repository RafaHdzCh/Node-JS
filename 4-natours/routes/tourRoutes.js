
const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.AliasTopTours, tourController.GetAllTours);

router.route('/tour-stats').get(tourController.GetTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.Protect,
    authController.RestrictTo('admin', 'lead', 'guide'),
    tourController.GetMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.GetToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.GetDistances);

router
  .route('/')
  .get(tourController.GetAllTours)
  .post(
    authController.Protect,
    authController.RestrictTo('admin', 'lead'),
    tourController.CreateTour
  );

  router.route("/:id")
  .get(tourController.GetTourByID)
  .patch(authController.Protect, 
         authController.RestrictTo("admin","lead"),
         tourController.UploadTourImages,
         tourController.ResizeTourImages,
         tourController.UpdateTourByID)
  .delete(authController.Protect, 
          authController.RestrictTo("admin","lead"), 
          tourController.DeleteTourByID);

module.exports = router;