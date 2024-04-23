const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 4;

//2
setTimeout(() => console.log("Timer 1 finished"), 0);
//6
setImmediate(() => console.log("Immediate 1 finished"));
//3
fs.readFile("text-file.txt", () => 
{
  //4
  console.log("I/O finished")
  //5
  console.log("------------")
  //9
  setTimeout(() => console.log("Timer 2 finished"), 0);
  //10
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  //8
  setImmediate(() => console.log("Immediate 2 finished"));
  //6
  process.nextTick(() => console.log("Process.nexttick()"));

  
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted")
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted")
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted")
  crypto.pbkdf2Sync("password", "salt", 100000, 1024, "sha512");
  console.log(Date.now() - start, "Password encrypted")

  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => console.log(Date.now() - start, "Password encrypted"));
  crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => console.log(Date.now() - start, "Password encrypted"));
  
});
//1
console.log("Hello from the top-level code");