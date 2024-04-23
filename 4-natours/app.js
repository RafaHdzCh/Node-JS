const hpp = require("hpp");
const path = require("path");
const xss = require("xss-clean");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const AppError = require("./Utilities/appError");
const viewRouter = require("./routes/viewRoutes");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const mongoSanitize = require("express-mongo-sanitize");
const errorController = require("./controllers/errorController");


const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname,"./views")); //Creates a path joining the provided path

//Serving static files
//app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname,"public")));

//#region GLOBAL MIDDLEWARE

// Set Security HTTP Headers with additional CSP directive
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:"],
      },
    },
  })
);

//Development login
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === "development")
{
  app.use(morgan("dev"));
}

//limit requests from same API
const limiter = rateLimit(
{
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP. Please try again in an hour!"
});
app.use("/api", limiter);

//Body parser, reading data from body into request.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({extended: true, limit: "10kb"}))
app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS (Cross site scripting)
app.use(xss());

//Prevent parameter pollution
app.use(hpp(
  {
    whitelist: 
    [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  }));

//Test middleware 
app.use((request,response,next) => 
{
  request.requestTime = new Date().toISOString();
  //console.log(request.cookies);
  next();
});

//#endregion

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);



//#region ERROR HANDLER
app.all("*", (request, response, next) => 
{
  next(new AppError(`Cant find ${request.originalUrl} on this server!`, 404)); //Any argument of next is an error
});
app.use(errorController);
//#endregion

module.exports = app;