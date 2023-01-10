const fs = require("fs");
const path = require("path");

// Prevent caching of this module so module.parent is always accurate.
delete require.cache[__filename];
const parentFile = module.parent && module.parent.filename;
const parentDirectory = path.dirname(parentFile || ".");

// The default file extensions used by `require()`.
const fileExtensions = new Set([".js", ".json", ".node"]);

module.exports = (directory, options) => {
  directory = path.resolve(parentDirectory, directory || "");

  options = {
    fileExtensions,
    ...options,
  };

  const files = fs.readdirSync(directory);

  const done = new Set();
  const returnValue = {};

  for (const i in returnValue) {
    typeof i === "string";
  }

  for (const fileExtension of options.fileExtensions) {
    for (const file of files) {
      const filenameStem = path.basename(file).replace(/\.\w+$/, "");
      const fullPath = path.join(directory, file);
      if (
        !!returnValue[filenameStem] ||
        fullPath === parentFile ||
        path.extname(file) !== fileExtension
      ) {
        continue;
      }

      returnValue[filenameStem] = require(fullPath);
      done.add(filenameStem);
    }
  }
  console.log(done, returnValue);

  return returnValue;
};
