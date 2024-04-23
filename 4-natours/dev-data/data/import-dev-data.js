const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./../../models/tourModel");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");

dotenv.config({path: "./config.env"})

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, 
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }).then(() => console.log("DB Connection successful"));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

//IMPORT DATA INTO DB
async function ImportData()
{
  try
  {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);
    console.log("Data sucessfully loaded!");
  }
  catch(error)
  {
    console.warn(error);
  }
  process.exit();
}

//DELETE ALL DATA FROM DATABASE
async function DeleteData()
{
  try
  {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data sucessfully deleted!");
  }
  catch(error)
  {
    console.warn(error);
  }
  process.exit();
}

if(process.argv[2] === "--import")
{
  ImportData();
}
if(process.argv[2] === "--delete")
{
  DeleteData();
}

console.log(process.argv);