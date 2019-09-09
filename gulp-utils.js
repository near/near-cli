var path = require("path");

function compile(inputFile, outputFile, callback) {
  const asc = getAsc();
  asc.main([
    inputFile,
    // TODO: Optimiziation is very slow, enable it only conditionally for "prod" builds?
    "-O1",
    "--baseDir", process.cwd(),
    "--binaryFile", outputFile,
    "--textFile",outputFile.substring(0,outputFile.lastIndexOf("."))+ ".wat",
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

  // Create parent directories if they don't exist
  function mkdirp(path){
    let dirname = pathModule.dirname(path);
    let paths = [];
    while (!fs.existsSync(dirname)){
      paths.unshift(pathModule.basename(dirname));
      dirname = pathModule.dirname(dirname);
    }
    if (paths.length > 0){
      for (const i in paths){
        fs.mkdirSync(pathModule.join(dirname, ...paths.slice(0,i + 1)))
      }
    }
  }

  asc.main = (main => (args, options, fn) => {
    if (typeof options === "function") {
      fn = options;
      options = undefined;
    }

    const logLn = process.browser ? window.logLn : console.log;
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
        mkdirp(name);
        fs.writeFileSync(name, contents);
      },
      listFiles: (dirname, baseDir) => {
        try {
          return fs.readdirSync(path.join(baseDir, dirname)).filter(file => /^(?!.*\.d\.ts$).*\.ts$/.test(file));
        } catch (e) {
          return null;
        }
      }
    }, fn);
  })(asc.main);
  return asc;
}


module.exports = { compile };
