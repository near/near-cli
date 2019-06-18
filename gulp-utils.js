// FUTURE PEOPLE: This file is called "gulp-utils" but it's not related to the deprecated library called "gulp-utils". Don't panic.
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
    "-O3",
    "--baseDir", "assembly",
    "--binaryFile", outputFile,
    "--sourceMap",
    "--measure",
    "--runtime", "stub"
  ], callback);
}

let asc;
function getAsc() {
  if (asc) {
    return asc;
  }

  asc = require("assemblyscript/bin/asc");

  const fs = require("fs");
  const pathModule = require("path");
  asc.main = (main => (args, options, fn) => {
    if (typeof options === "function") {
      fn = options;
      options = undefined;
    }

    const logLn = process.browser ? window.logLn : console.log;
    return main(args, options || {
      stdout: process.stdout || asc.createMemoryStream(),
      stderr: process.stderr || asc.createMemoryStream(logLn),
      readFile: (filename, baseDir) => {
        baseDir = pathModule.relative(process.cwd(), baseDir);
        let path = pathModule.join(baseDir, filename);
        if (path.startsWith("out/") && path.indexOf(".near.ts") == -1) {
          path = path.replace(/^out/, baseDir );
        } else if (path.startsWith(baseDir) && path.indexOf(".near.ts") != -1) {
          path = path.replace(new RegExp("^" + baseDir), "out");
        }

        if (!fs.existsSync(path)) {
          // TODO: Try node_modules instead of fixed hardcode
          const mapping = {
            "assembly/near.ts" : "./node_modules/near-runtime-ts/near.ts",
            "assembly/json/encoder.ts" : "./node_modules/assemblyscript-json/assembly/encoder.ts",
            "assembly/json/decoder.ts" : "./node_modules/assemblyscript-json/assembly/decoder.ts",
          };
          if (path in mapping) {
            path =  mapping[path]
          } else if (path.startsWith("assembly/node_modules/bignum/assembly")) {
            path = path.replace("assembly", ".");
          }
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
