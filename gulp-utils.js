// FUTURE PEOPLE: This file is called "gulp-utils" but it's not related to the deprecated library called "gulp-utils". Don't panic.
// function generateBindings(inputFile, outputFile, callback) {
//   const asc = getAsc();
//   asc.main([
//     inputFile,
//     "--baseDir", process.cwd(),
//     "--nearFile", outputFile,
//     "--measure"
//   ], callback);
// }
let compile = require("near-runtime-ts").compile;

module.exports = { compile };
