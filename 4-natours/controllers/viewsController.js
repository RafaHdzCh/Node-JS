const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const AppError = require("../Utilities/appError");
const CatchAsync = require("../Utilities/catchAsync");



module.exports.GetOverview = CatchAsync(async(request,response) =>
{
  //1) Get tour data from collection
  const tours = await Tour.find();

  //2) Build template 

  //3) Render that template using tour data from 1
  response.status(200).render("overview", 
  {
    title: "All Tours",
    tours
  });
});

module.exports.GetTour = CatchAsync(async(request,response, next) =>
{
  //1 Get data for the requested tour
  const tour = await Tour.findOne({slug: request.params.slug}).populate(
    {
      path: "reviews",
      fields: "review rating user"
    });

    if(!tour)
    {
      console.log("No tour")
      return next(new AppError("There is no tour with that name.", 404))
    }
  //2 Build template 
  

  //3 Render template using data from step 1
  response
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  });

module.exports.GetLoginForm = CatchAsync(async(request,response) =>
{
  response
  .status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' https://cdnjs.cloudflare.com")
  .render("login", 
  {
    title: "Log into your account"
  })
});

module.exports.GetAccount = (request,response) =>
{
  response
  .status(200)
  .render("account", 
  {
    title: "Your account"
  })
}

module.exports.UpdateUserData  = CatchAsync(async(request,response) =>
{
  const updatedUser = await User.findByIdAndUpdate(request.user.id, 
  {
    name: request.body.name,
    email: request.body.email
  }, 
  {
    new: true,
    runValidators: true,
  });
  response
  .status(200)
  .set('Content-Security-Policy',"img-src 'self' data: blob:")
  .render("account", 
  {
    title: "Your account",
    user: updatedUser
  });
});