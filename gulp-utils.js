function generateBindings(inputFile, outputFile, callback) {
  const asc = getAsc();
  asc.main([
    inputFile,
    "--baseDir", "assembly",
    "--nearFile", outputFile,
    "--measure"
  ], callback);
}

function compile(inputFile, outputFile, callback) {
  const asc = getAsc();
  asc.main([
    inputFile,
    "--baseDir", "assembly",
    "--binaryFile", outputFile,
    "--sourceMap",
    "--measure"
  ], callback);
}

let asc;
function getAsc() {
  if (asc) {
    return asc;
  }

  asc = require("assemblyscript/bin/asc");
  if (asc.runningInStudio) {
    return asc;
  }

  const fs = require("fs");
  const pathModule = require("path");
  asc.main = (main => (args, options, fn) => {
    if (typeof options === "function") {
      fn = options;
      options = undefined;
    }

    return main(args, options || {
      stdout: process.stdout,
      stderr: process.stderr,
      readFile: (filename, baseDir) => {
        baseDir = pathModule.relative(process.cwd(), baseDir);
        let path = pathModule.join(baseDir, filename);
        if (path.startsWith("out/") && path.indexOf(".near.ts") == -1) {
          path = path.replace(/^out/, baseDir );
        } else if (path.startsWith(baseDir) && path.indexOf(".near.ts") != -1) {
          path = path.replace(new RegExp("^" + baseDir), "out");
        }
        return fs.readFileSync(path).toString("utf8");
      },
      writeFile: (filename, contents) => {
        const name = filename.startsWith("../") ? filename.substring(3) : filename;
        fs.writeFileSync(name, contents);
      },
      listFiles: () => []
    }, fn);
  })(asc.main);
  return asc;
}

module.exports = { generateBindings, compile };