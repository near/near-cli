// FUTURE PEOPLE: This file is called "gulp-utils" but it's not related to the deprecated library called "gulp-utils". Don't panic.
function generateBindings(inputFile, outputFile, callback) {
  const asc = getAsc();
  asc.main([
    inputFile,
    "--baseDir", process.cwd(),
    "--nearFile", outputFile,
    "--measure"
  ], callback);
}

function compile(inputFile, outputFile, callback) {
  const asc = getAsc();
  asc.main([
    inputFile,
    // TODO: Optimiziation is very slow, enable it only conditionally for "prod" builds?
    "-O1",
    "--baseDir", process.cwd(),
    "--binaryFile", outputFile,
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
    console.log("asc " + args.join(" "));
    return main(args, options || {
      stdout: process.stdout || asc.createMemoryStream(logLn),
      stderr: process.stderr || asc.createMemoryStream(logLn),
      readFile: (filename, baseDir) => {
        baseDir = pathModule.relative(process.cwd(), baseDir);
        let path = pathModule.join(baseDir, filename);
        if (!fs.existsSync(path)) {
            return null;
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
