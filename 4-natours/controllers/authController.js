const crypto = require("crypto");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Email = require("../Utilities/email");
const AppError = require("../Utilities/appError");
const CatchAsync = require("./../Utilities/catchAsync");
const { url } = require("inspector");

function SignToken(id)
{
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

function CreateSendToken(user, statusCode, statusMessage, response) 
{
  const token = SignToken(user._id);
  const cookieOptions = 
  {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // Convertir minutos a milisegundos
    secure: true,
    httpOnly: true
  };
  if (process.env.NODE_ENV !== "production") 
  {
    cookieOptions.secure = false; // Cambiado a false para ambientes de desarrollo
  }
  response.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  response.status(statusCode).json(
    {
    status: statusMessage,
    token: token,
    data: 
    {
      user: user
    }
  });
}

module.exports.SignUp = CatchAsync(async(request, response) =>
{
  const newUser = await User.create(
  {
    name: request.body.name,
    email: request.body.email,
    photo: request.body.photo,
    role: request.body.role,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    passwordResetToken: request.body.passwordResetToken,
    passwordResetExpires: request.body.passwordResetExpires,
    active: request.body.active,
  });

  const url = `${request.protocol}://${request.get("host")}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  CreateSendToken(newUser, 201, "User created!", response);
});

module.exports.Login = CatchAsync(async(request, response, next) =>
{
  const email = request.body.email;
  const password = request.body.password;

  if(!email || !password)
  {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user= await User.findOne({email}).select("+password");

  if(!user || !(await user.correctPassword(password, user.password)))
  {
    return next(new AppError("Incorrect email or password.", 401));
  }
  
  CreateSendToken(user, 200, "success", response);
});

module.exports.LogOut = (request, response) =>
{
  response.cookie("jwt", "logged out",
  {
    expires: new Date(Date.now() + 1 * 100),
    httpOnly: true
  });
  response.status(200).json({status: "success"});
};

module.exports.Protect = CatchAsync(async(request, response, next) =>
{
  //1) Get token
  let token;

  if(request.headers.authorization && 
     request.headers.authorization.startsWith("Bearer"))
  {
    token = request.headers.authorization.split(" ")[1];
  }
  else if(request.cookies.jwt)
  {
    token = request.cookies.jwt;
  }
  if(!token)
  {
    return next(new AppError("You are not logged in! Please login to get access."),401);
  }
  //console.log(`Step 1: The login token is: ${token}`);
  

  //2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(`Step 2: Token verified:`);
  //console.log(decoded);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if(!currentUser) 
  {
    return next(new AppError("The user no longer exists."),401);
  }

  //4) Check if user changed password after the token was issued
  if(currentUser.ChangedPasswordAfter(decoded.iat))
  {
    return next(new AppError("User recently changed password! Please log in again."), 401);
  };
  
  //console.log("Grant access to protected route.");
  request.user = currentUser;
  response.locals.user = currentUser;
  next();
});

//Only for render pages.There are no errors
module.exports.IsLoggedIn = CatchAsync(async (request, response, next) => 
{
  const token = request.cookies.jwt;

  if (!token) 
  {
    return next();
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser || currentUser.ChangedPasswordAfter(decoded.iat)) 
  {
    return next();
  }

  response.locals.user = currentUser;
  next();
});

module.exports.RestrictTo = (...roles) =>
{
  return (request,response, next) =>
  {
    if(!roles.includes(request.user.role))
    {
      return next(new AppError("You do not have permission to delete a tour.",403));
    }
    next();
  }
};

module.exports.ForgotPassword = CatchAsync(async (request, response, next) => {
  // 1) Get user based on the POSTed email
  const user = await User.findOne({ email: request.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email address."), 404);
  }

  // 2) Generate the random reset password token
  const resetToken = user.CreatePasswordResetToken();
  
  // 3) Save the token and expiration date to the database
  await user.save({ validateBeforeSave: false });

  // 4) Build the password reset URL
  const resetURL = `${request.protocol}://${request.get("host")}/api/v1/users/resetPassword/${resetToken}`;
  
  const message = `
    Forgot your password? 
    Submit a PATCH request with your new password and passwordConfirm to ${resetURL}
    If you didn't forget your password, please ignore this email.
  `;
  try 
  {
    await new Email(user, resetURL).sendPasswordReset();

    response.status(200).json({   
      status: "Password reset token successfully sent!",
      message: "Token sent to email!"
    });
  } catch(error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email. Try again later!"), 500);
  }
});

module.exports.ResetPassword = CatchAsync(async(request, response, next) => 
{
  // 1)Get user based on token
  const hashedToken = crypto.createHash("sha256")
                            .update(request.params.token)
                            .digest("hex");
  //console.log("El hashed token es: " + hashedToken);
  const user = await User.findOne(
  {
    passwordResetToken: hashedToken, 
    passwordResetExpires: 
    {
      $gt: Date.now()
    }
  });

  //console.log("El usuario que quiere cambiar su contraseña es: " + user)

  // 2) If token has not expired, and there is user, set new password
  if(!user)
  {
    return next(new AppError("Token is invalid or has expired.", 400))
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt propery for the user

  // 4) Log the user in, send JWT
  CreateSendToken(user, 200, "Password reset!", response);
});

module.exports.UpdatePassword = CatchAsync(async(request, response, next) => 
{
  //1) Get user from collection
  const user = await User.findById(request.user.id).select("+password");

  //2) Check if POSTed password is correct
  if(!(await user.correctPassword(request.body.passwordCurrent, user.password)))
  {
    return next(new AppError("Your current password is wrong!", 401));
  }

  //3) If the password is correct, update the password
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  await user.save();

  //4) Log user in, send JWT
  CreateSendToken(user, 200, "Password updated!", response);
});
