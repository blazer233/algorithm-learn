const fileUtil = require("../files");
const path = require("path");
const handleArr = ["pages"];

handleArr.forEach(it => {
  const files = path.resolve(__dirname, `../${it}`);
  console.log(files);
  const res = fileUtil.readflat(files);
  Object.keys(res).forEach(i => {
    const item = res[i];
    let [jsfile, domfile, jsonfile] = [];
    item.forEach(j => {
      if (path.extname(j) == ".js") jsfile = j;
      if (path.extname(j) == ".wxml") domfile = j;
      if (path.extname(j) == ".json") jsonfile = j;
    });
    if (jsfile && domfile && jsonfile) {
      console.log(jsonfile);
      let [fjson, fdom] = [{}];
      fjson = JSON.parse(fileUtil.readFile(jsonfile));
      fdom = fileUtil.readFile(domfile);
      if (fjson.usingComponents) {
        Object.keys(fjson.usingComponents).forEach(i => {
          if (!fdom.includes(`<${i}`)) delete fjson.usingComponents[i];
        });
        fileUtil.writeFile(jsonfile, JSON.stringify(fjson, null, 2));
      }
    }
  });
});
