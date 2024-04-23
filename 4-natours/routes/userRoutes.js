/*
const express = require('express');
const factory = require("../controllers/handlerFactory");
const sharp = require("sharp");
const User = require("./../models/userModel");
const AppError = require("../Utilities/appError");
const CatchAsync = require("./../Utilities/catchAsync");
const multer = require("multer");
const router = express.Router();
const multerStorage = multer.memoryStorage();
const userController = require('../controllers/userController');

router.route('/updateMe').patch(userController.UpdateMe);


const multerFilter = (request, file, CallbackFunction) =>
{
  if(file.mimetype.startsWith("image"))
  {
    CallbackFunction(null, true);
  }
  else
  {
    error = new AppError("The file is not an image.", 400);
    CallbackFunction(error, false);
  }
}

const upload = multer(
{
  storage: multerStorage,
  fileFilter: multerFilter
});

module.exports.UploadUserPhoto = upload.single("photo");

module.exports.ResizeUserPhoto = async (request, response, next) =>
{
  if(!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500,500)
    .toFormat("jpeg")
    .jpeg({quality: 90})
    .toFile(`public/img/users/${request.file.filename}`);

  next();
}

function FilterObject(object, ...allowedFields)
{
  const newObject = {};
   
  Object.keys(object).forEach(element => 
  {
      if(allowedFields.includes(element))
      {
        newObject[element] = object[element];
      }
  });

  return newObject;
}

module.exports.CreateUser = function(request, response)
{
  response.status(500).json(
    {
      status: "ERROR",
      message: "Use /signup instead!"
    })
}

module.exports.GetMe = (request,response,next) =>
{
  request.params.id = request.user.id;
  next();
}

module.exports.UpdateMe = CatchAsync(async function(request, response, next) 
{
  // 1. Create error if user POSTs password data
  if (request.body.password || request.body.passwordConfirm) 
  {
    return next(new AppError("This route is not for password updates! Please use /updateMyPassword", 400));
  }

  // 2. Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = FilterObject(request.body, "name", "email");

  // 3. Resize and save user photo
  if (request.file) 
  {
    request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

    await sharp(request.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${request.file.filename}`);

    filteredBody.photo = request.file.filename;
  }

  // 4. Update user document
  const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, 
  {
    new: true,
    runValidators: true
  });

  // 5. Send response
  response.status(200)
    .set('Content-Security-Policy', "img-src 'self' data: blob:")
    .json({
      status: "success",
      data: {
        user: updatedUser
      }
    });
});

module.exports.DeleteMe = CatchAsync(async function(request, response, next)
{
  await User.findByIdAndUpdate(request.user.id, {active:false});
  response.status(204).json(
  {
    status:"Successfully deleted.",
    data: null
  })
});

module.exports.GetUser = factory.GetOne(User);
module.exports.GetAllUsers = factory.GetAll(User);
module.exports.UpdateUser = factory.UpdateOne(User);
module.exports.DeleteUser = factory.DeleteOne(User);
module.exports = router;
*/

const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.SignUp);
router.post('/login', authController.Login);
router.get('/logout', authController.LogOut);

router.post('/forgotPassword', authController.ForgotPassword);
router.patch('/resetPassword/:token', authController.ResetPassword);

// Protect all routes after this middleware
router.use(authController.Protect);

router.patch('/updateMyPassword', authController.UpdatePassword);
router.get('/me', userController.GetMe, userController.GetUser);
router.patch(
  '/updateMe',
  userController.UploadUserPhoto,
  userController.ResizeUserPhoto,
  userController.UpdateMe
);
router.delete('/deleteMe', userController.DeleteMe);

router.use(authController.RestrictTo('admin'));

router
  .route('/')
  .get(userController.GetAllUsers)
  .post(userController.CreateUser);

router
  .route('/:id')
  .get(userController.GetUser)
  .patch(userController.UpdateUser)
  .delete(userController.DeleteUser);

module.exports = router;