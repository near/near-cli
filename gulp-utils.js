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

module.exports = require('near-bindgen-as/compiler');
