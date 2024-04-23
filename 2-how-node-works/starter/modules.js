//console.log(arguments);
//sconsole.log(require("module").wrapper);


//module.exports TEST 1
const Calculator = require("./test-module-1");
const calculator1 = new Calculator();
console.log(calculator1.Add(2,5));

//exports TEST 2
const Calculator2 = require("./test-module-2");
console.log(Calculator2.Add(4,5));

//caching TEST 3
require("./test-module-3")();