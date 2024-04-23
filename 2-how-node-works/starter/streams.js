const fs = require("fs");
const server = require("http").createServer();

server.on("request", (request, response) => 
{
  //Solution 1 
  /*
  fs.readFile("test-file.txt", (error, data) => 
  {
    if(error) console.log(error);
    response.end(data);
  });
  */

  //Solution 2: Streams
  /*
  const readable = fs.createReadStream("testttt-file.txt");
  readable.on("data", chunk => 
  {
    response.write(chunk);
  });
  readable.on("end", () => response.end());
  readable.on("error", error => 
  {
    console.log(error)
    response.statusCode = 500;
    response.end("File not found");
  });
  */

  //Solution 3
  const readable = fs.createReadStream("test-file.txt");
  readable.pipe(response);
  //readableObject.pipe(writableObject);
});

server.listen(8000, "127.0.0.1", () => 
{
  console.log("Listening...");
});