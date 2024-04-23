const multer = require('multer');
const sharp = require('sharp');
const factory = require("./handlerFactory");
const Tour = require("./../models/tourModel");
const CatchAsync = require("./../Utilities/catchAsync");
const AppError = require("../Utilities/appError");


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

module.exports.UploadTourImages = upload.fields(
  [
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 }
  ]
);

module.exports.ResizeTourImages = async (request, response, next) =>
{
  console.log(request.files);
  if(!request.files.imageCover || !request.files.images) return next();

  //Cover Image
  const imageCoverFilename = `tour-${request.params.id}-${Date.now()}-cover.jpeg`
  await sharp(request.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);
  request.body.imageCover = imageCoverFilename;

  //Images
  request.body.images = [];
  await Promise.all(request.files.images.map(async (file, index) => 
  {
    const filename = `tour-${request.params.id}-${Date.now()}-${index+1}.jpeg`;
    await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`);

    request.body.images.push(filename);
  }));

  console.log(request.body);
  next();
}

module.exports.AliasTopTours = async function(request,response,next)
{
  request.query.limit = "5";
  request.query.sort = "-ratingsAverage,price";
  request.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

module.exports.GetTourStats = CatchAsync(async (request, response) =>
{
  const stats = await Tour.aggregate(
    [
      { $match: {ratingsAverage: {$gte: 4.5}}},
      { $group: 
        {
          _id: "$difficulty", 
          minPrice: { $min: "$price"},
          maxPrice: { $max: "$price"},
          avgPrice: { $avg: "$price"},
          avgRating: {$avg: "$ratingsAverage"}, 
          numRatings: {$sum: "$ratingsQuantity"},
        }
      },
      //{ $match: {_id:{$ne: "easy"}} } //It is possible to do multiple matches.
    ]);
    
    response.status(200).json(
    {
      status: "Stats calculated sucessfully.",
      data: stats
    });
});
  
module.exports.GetMonthlyPlan = CatchAsync(async (request, response) =>
  {
    const year = Number(request.params.year); //2021
    const plan = await Tour.aggregate([
      { $unwind: "$startDates" },
      {
        $match:
        {
          startDates: 
      {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      }
    }
  },
  {
    $group: 
    {
      _id: { $month: "$startDates"},
      numTourStarts: {$sum: 1},
      tours: { $push: "$name"}
    }
  },
  { $addFields: { month: "$_id" } },
  { $project: { _id: 0 } },
  { $sort: { numTourStarts: -1 } },
  { $limit: 6 }
]);

response.status(200).json(
  {
    status: "Mothly plan loaded.",
    data: plan
  });
});

module.exports.GetToursWithin = CatchAsync(async (request, response) =>
{
  //router.route("/tours-within/:distance/center/:latlng/unit/:unit", tourController.GetToursWithin);
  const {distance, latlng, unit} = request.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if(!lat || !lng)
  {
    next(new AppError("Please provide latitude and lnogitude in the format!"), 400);
  }

  const tours = await Tour.find(
  {
    startLocation: 
    {
      $geoWithin: 
      {
        $centerSphere: 
        [
          [lng,lat],
          radius
        ]
      }
    }
  });

  response.status(200).json(
    {
      status: "Location received.",
      results: tours.length,
      data: 
      {
        data: tours
      }
    });
});

module.exports.GetDistances = CatchAsync(async (request, response) =>
{
  const {latlng, unit} = request.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit ==="mi" ? 0.000621371 : 0.001;

  if(!lat || !lng)
  {
    next(new AppError("Please provide latitude and lnogitude in the format!"), 400);
  }

  const distances = await Tour.aggregate(
  [
    {
      $geoNear: 
      {
        near: 
        {
          type: "Point",
          coordinates: [Number(lng), Number(lat)]
        },
        distanceField: "distance", 
        distanceMultiplier: multiplier
      }
    },
    {
      $project: 
      {
        distance: 1,
        name: 1
      }
    }
  ]);

  response.status(200).json(
    {
      status: "Location received.",
      data: 
      {
        data: distances
      }
    });
});

module.exports.GetAllTours = factory.GetAll(Tour);
module.exports.CreateTour = factory.CreateOne(Tour);
module.exports.DeleteTourByID = factory.DeleteOne(Tour);
module.exports.UpdateTourByID = factory.UpdateOne(Tour);
module.exports.GetTourByID = factory.GetOne(Tour, {path: "reviews"});