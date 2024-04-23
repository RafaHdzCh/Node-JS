const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

//#region Start Server

mongoose
  .connect(DB, 
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log("Server online..."))
  .catch(error => console.log(error));

const app = require("./app");
const port = process.env.PORT || 3000;

app.listen(port, () => {console.log(`App running on port: ${port}...`)});

//#endregion



//#region Error Caughter

function ErrorHandler(error)
{
  console.log('ERROR OCCURRED! Shutting down!');
  const fullMessage = error.message;
  const errmsgStart = 0;
  const newline = /\n/;
  let errmsgStop = fullMessage.search(newline);
  
  if (errmsgStop < 0) 
  {
    errmsgStop = fullMessage.length;
  }
  const errorText = fullMessage.substring(errmsgStart, errmsgStop);
  console.log(
    `
      💥 Error Name 💥: ${error.name}
      💥 Error Text 💥: ${errorText}
    `);
  server.close(() => 
  {
    process.exit(1);
  });
}

process.on("uncaughtException", ErrorHandler);
process.on('unhandledRejection', ErrorHandler);

//#endregion
