const EventEmitter = require("events");


class Sales extends EventEmitter
{
  constructor()
  {
    super(); //Get access to all methods in the parent class
  }
}
const myEmmiter = new Sales();
myEmmiter.on("newSale", () => {console.log("There was a new sale!")});
myEmmiter.on("newSale", () => {console.log("Costumer name: Rafa!")});

myEmmiter.on("newSale", stock => {console.log(`There are now ${stock} items left.`)})

myEmmiter.emit("newSale", 9);
