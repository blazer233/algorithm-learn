const fileUtil = require("../");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const types = require("@babel/types");
const generator = require("@babel/generator").default;

const addCatch = pt => {
  const jsfile = path.resolve(__dirname, pt);
  const fjs = fileUtil.readFile(jsfile);
  const ast = parse(fjs, { sourceType: "module" });
  // 判断async函数
  const isAsyncFuncNode = node => {
    return (
      types.isFunctionDeclaration(node, { async: true }) ||
      types.isArrowFunctionExpression(node, { async: true }) ||
      types.isFunctionExpression(node, { async: true }) ||
      types.isObjectMethod(node, { async: true })
    );
  };
  traverse(ast, {
    AwaitExpression(path) {
      // 递归向上找异步函数的 node 节点
      while (path && path.node) {
        let parentPath = path.parentPath;
        // 已经包含 try 语句则直接退出
        if (
          types.isBlockStatement(path.node) &&
          types.isTryStatement(parentPath.node)
        ) {
          return;
        }
        // 确认 async function
        if (
          types.isBlockStatement(path.node) &&
          isAsyncFuncNode(parentPath.node)
        ) {
          // 创建 tryStatement https://www.babeljs.cn/docs/babel-types#trystatement
          let tryCatchAst = types.tryStatement(
            path.node,
            types.catchClause(
              types.Identifier("e"),
              types.BlockStatement(parse(`console.error(e)`).program.body)
            ),
            null
          );
          path.replaceWithMultiple([tryCatchAst]);
          return;
        }
        path = parentPath; // 递归
      }
    },
  });
  let { code } = generator(ast);
  fileUtil.writeFile(jsfile, code);
};
addCatch("../../npm-learn/promise-pool/core.js");
