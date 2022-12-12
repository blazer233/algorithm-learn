const fs = require("fs");
const path = require("path");

function mkdirDeep(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return true;
    }
    if (mkdirDeep(path.dirname(filePath))) {
      fs.mkdirSync(filePath);
      return true;
    }
  } catch (e) {
    console.error("mkdir", e);
  }
  return false;
}

function generate(filesPath, fileType, result = []) {
  const files = fs.readdirSync(filesPath);
  files.forEach(element => {
    const filePath = path.resolve(`${filesPath}/${element}`);
    if (fs.statSync(filePath).isDirectory()) {
      generate(filePath, fileType, result);
    } else {
      if (path.extname(filePath) === fileType) {
        result.push(element);
      }
    }
  });
  return result;
}

function flatFiles(filesPath, faPath) {
  const stack = [filesPath];
  const result = {};
  const resultdef = [];
  while (stack.length) {
    const root = stack.shift();
    const files = fs.readdirSync(root);
    const menu = path.dirname(root);
    const name = path.basename(root);
    if (files.length) {
      files.forEach(i => {
        const filePath = path.join(menu, name, i);
        if (fs.statSync(filePath).isFile()) {
          if (faPath) {
            const [pushPath] = filePath.split(".");
            result[pushPath] = result[pushPath] || [];
            result[pushPath].push(filePath);
          } else {
            resultdef.push(filePath);
          }
        } else {
          stack.push(filePath);
        }
      });
    }
  }
  return faPath ? result : resultdef;
}

module.exports = {
  fileExists(filePath) {
    let res = false;
    try {
      res = fs.statSync(filePath).isFile();
    } catch (err) {
      // console.log('fileExists error', err)
    }
    return res;
  },
  rmFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error("removeFile", e);
    }
  },
  writeFile(distFilePath, content) {
    try {
      mkdirDeep(path.dirname(distFilePath));
      fs.writeFileSync(distFilePath, content);
    } catch (e) {
      console.error("writeFile", e);
    }
  },
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.error("readFile", e);
    }
  },
  copyFile(filePath, distFilePath) {
    try {
      fs.writeFileSync(distFilePath, fs.readFileSync(filePath));
    } catch (e) {
      console.error("copyFile", e);
    }
  },
  mkdir(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
        return true;
      }
    } catch (e) {
      console.error("mkdir", e);
    }
    return false;
  },
  rmdir(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.rmdirSync(filePath);
      }
    } catch (e) {
      console.error("mkdir", e);
    }
  },
  mkdirDeep,
  readflat(filePath, fathpath = true) {
    try {
      return flatFiles(filePath, fathpath);
    } catch (e) {
      console.error("mkdir", e);
    }
  },
};
