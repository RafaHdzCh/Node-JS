const fs = require("fs");
const url = require("url");
const http = require("http");
const slugify = require("slugify");
const ReplaceTemplate = require("./modules/replaceTemplate");

/////////////////////////////////////
//FILES

//Blocking Synchronous
/*
const textIN = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIN);
const textOut = `This is what we know about the avocado: ${textIN}. Created on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log( "File has been written.")
*/

//Non-blocking asynchronous
/*
fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (error, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt",`${data2}${data3}`, "utf-8", error => {
        console.log("Your file has been written.")
      })
    });
  });
});
console.log("Will read file...");
*/


/////////////////////////////////////
//SERVER

const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

const slugs = dataObject.map(element => slugify(element.productName, {lower: true}));
console.log(slugs);
const server = http.createServer((request, response) => 
{
  const {query, pathname} = url.parse(request.url,true);

  //Overview page
  if(pathname === "/" || pathname === "/overview")
  {
    response.writeHead(200, {"Content-type": "text/html"});
    const cardsHTML = dataObject.map(element => ReplaceTemplate(templateCard, element)).join("");
    const output = templateOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);
    response.end(output);
  }

  //Product page
  else if(pathname === "/product")
  {
    const product = dataObject[query.id];
    response.writeHead(200, {"Content-type": "text/html"});
    const output = ReplaceTemplate(templateProduct, product);
    response.end(output);
  }

  //API 
  else if(pathname === "/api")
  {
    response.writeHead(200, {"Content-type": "application/json"});
    response.end(data);
  }

  //NOT FOUND
  else
  {
    response.writeHead(404, 
      {
        "Content-type": "text/html",
        "my-own-header": "hello-world"
      });
    response.end("<h1>PAGE NOT FOUND!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => 
{
  console.log("Listening to requests on port 8000...");
});

