const fileUtil = require("../files");
const path = require("path");
const { Parser } = require("htmlparser2");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const generator = require("@babel/generator").default;
const INIT_PAGE_FUNC = [
  "onLoad",
  "onReachBottom",
  "onUnload",
  "onShow",
  "onInit",
  "_initData",
  "_handleTips",
  "onShareAppMessage",
];

// const handleArr = ['pages','pkgBg','pkgApproval', pkgQuality','pkgCheck','pkgData','pkgLearn']
const handleArr = ["components", "pages"];
handleArr.forEach(it => {
  const files = path.resolve(__dirname, `../${it}`);
  const res = fileUtil.readflat(files);
  Object.keys(res).forEach(i => {
    const item = res[i];
    const domMethods = new Set();
    const jsMethods = new Set();
    let [result, jsfile, domfile, jsonfile] = [[]];
    let [fjson, fdom, fjs] = [{}];
    item.forEach(j => {
      if (path.extname(j) == ".js") jsfile = j;
      if (path.extname(j) == ".wxml") domfile = j;
      if (path.extname(j) == ".json") jsonfile = j;
    });
    if (jsfile && domfile && jsonfile) {
      fjs = fileUtil.readFile(jsfile);
      const parser = new Parser({
        onattribute(attr, name) {
          if (attr.startsWith("bind") || attr.startsWith("catch")) {
            domMethods.add(name);
          }
        },
      });
      parser.parseComplete(fileUtil.readFile(domfile));
      const ast = parse(fjs, { sourceType: "module" });
      fjson = JSON.parse(fileUtil.readFile(jsonfile));
      traverse(ast, {
        CallExpression(path) {
          const childrens = path.node.callee;
          if (types.isThisExpression(childrens.object)) {
            jsMethods.add(childrens.property.name);
          }
        },
      });
      if (fjson.component) {
        traverse(ast, {
          ObjectExpression(path) {
            const parent = path.parent;
            if (parent.key && parent.key.name == "methods") {
              if (path.node?.properties && path.node.properties.length) {
                path.node.properties.forEach((i, idx) => {
                  if (
                    !INIT_PAGE_FUNC.includes(i.key.name) &&
                    !jsMethods.has(i.key.name) &&
                    !domMethods.has(i.key.name)
                  ) {
                    // const paths = path.get(`properties.${idx}`);
                    // paths.remove();
                    result.push(i.key.name);
                  }
                });
              }
            }
          },
        });
      } else {
        traverse(ast, {
          ClassDeclaration(path) {
            const childrens = path.node.body.body;
            if (childrens && childrens.length) {
              childrens.forEach((i, index) => {
                if (
                  types.isClassMethod(i) &&
                  !INIT_PAGE_FUNC.includes(i.key.name) &&
                  !jsMethods.has(i.key.name) &&
                  !domMethods.has(i.key.name)
                ) {
                  // const paths = path.get(`body.body.${index}`);
                  // paths.remove();
                  result.push(i.key.name);
                }
              });
            }
          },
        });
      }
      // let { code } = generator(ast);
      if (result.length) {
        console.log(jsfile, result);
      }
      // if (code.replace(/\s*/g, "") != fjs.replace(/\s*/g, "")) {
      // fileUtil.writeFile(jsfile, code);
      // }
    }
  });
});
