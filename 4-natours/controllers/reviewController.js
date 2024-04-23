const factory = require("./handlerFactory");
const Review = require("./../models/reviewModel");

//#region Middleware

module.exports.SetTourUserIDs = (request, response, next) =>
{
  //Allow nested routes
  request.body.tour ??= request.params.tourId;
  request.body.user ??= request.user.id;
  next();
}

//#endregion

module.exports.GetReviewByID = factory.GetOne(Review);
module.exports.GetAllReviews = factory.GetAll(Review);
module.exports.CreateReview = factory.CreateOne(Review);
module.exports.UpdateReviewByID = factory.UpdateOne(Review);
module.exports.DeleteReviewByID = factory.DeleteOne(Review);