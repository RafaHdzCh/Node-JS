const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
{
    name: 
    {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters."],
      minlength: [8, "A tour name must have more or equal then 8 characters."],
      //validate: [validator.isAlpha, "Tour name must only contain characters."]
    },
    slug:
    {
      type: String,
    },
    duration:
    {
      type: Number,
      required: [true, "A tour must have a duration."]
    },
    maxGroupSize:
    {
      type: Number,
      required: [true, "A tour must have a group size."]
    },
    difficulty:
    {
      type: String,
      required: [true, "A tour must have a difficulty."],
      enum:
      {
        values: ["easy", "medium", "difficult"],
        message: "Difficuty is either: easy, medium or difficult.",
      } 
    },
    ratingsAverage: 
    {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: value => Math.round(value * 10) / 10
    },
    ratingsQuantity: 
    {
      type: Number,
      default: 0
    },
    price: 
    {
      type: Number,
      required: [true, "A tour must have a price."]
    },
    priceDiscount:
    {
      type: Number,
      validate: 
      {
        validator: function(value)
        {
          //This only points to the current document on NEW document creation
          return value < this.price;
        },
        message: "Discount price must be below the regular price.",
      }
    },
    summary:
    {
      type: String,
      trim: true,
      required: [true, "A tour must have a description."]
    },
    description:
    {
      type: String,
      trim: true,
    },
    imageCover:
    {
      type: String,
      required: [true, "A tour must have a cover image."]
    },
    images:[String],
    createdAt:
    {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour:
    {
      type: Boolean,
      default: false
    },
    startLocation:
    {
      //GeoJSON
      type: 
      {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: 
    [
      {
        type: 
        {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [String],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: 
    [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      }
    ],
  }, 
  {
    toJSON: {virtuals: true}, 
    toObject: {virtuals: true}
  }
);

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: "2dsphere"})

tourSchema.virtual("durationWeeks").get(function()
{
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual("reviews", 
{
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
});
  
//#region DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre("save", function(next)
{
  //console.log("Creating slug name...");
  this.slug = slugify(this.name, {lower: true});
  next();
});

/*
EMBEDDED GUIDES
tourSchema.pre("save",async function(next)
{
  //Retrieve all guide names for the tour
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/
tourSchema.post("save", function(document, next)
{
  //console.log("Document saved.");
  next();
});
//#endregion

//#region QUERY MIDDLEARE
tourSchema.pre(/^find/, function(next)
{
  //console.log("Filtering secret tours...");
  this.find({secretTour: {$ne: true}});
  this.start = Date.now();
  //console.log("Secret tours filtered...");
  next();
});
tourSchema.post(/^find/, function(documents, next)
{
  //console.log("Calculating query time...");
  console.log(`This query took ${Date.now()-this.start} milliseconds!`);
  next();
});

tourSchema.pre(/^find/, function(next)
{
  this.populate(
  {
    path: "guides",
    select: "-__v -passwordChangedAt"
  });
  next();
});

//#endregion

//#region AGGREGATION MIDDLEWARE
/*
tourSchema.pre("aggregate", function(next)
{
  this.pipeline().unshift({$match:{secretTour: {$ne: true}}});
  //console.log(this.pipeline());
  next();
});
*/
//#endregion

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;