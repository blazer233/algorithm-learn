const pify = require("./core");
const request = require("request");

const fs = require("fs");

pify(fs.readFile)("package.json", "utf8").then(data => {
  console.log(JSON.parse(data));
});

// pify(fs)
//   .readFile("package.json", "utf8")
//   .then(data => {
//     console.log(JSON.parse(data));
//   });

// const pRequest = pify(request, { multiArgs: true });

// pRequest("https://sindresorhus.com").then(data => {
//   console.log(JSON.parse(data));
// });
