const gulp = require("gulp");

gulp.task("build:bindings", callback => {
  console.log("build:bindings impl");
  const asc = require("assemblyscript/bin/asc");
  asc.main([
    "main.ts",
    "--baseDir", "assembly",
    "--binaryFile", "../out/main.wasm",
    "--nearFile", "../out/main.near.ts", 
    "--measure"
  ], callback);
});

gulp.task("build", ["build:bindings"], callback => {
  console.log("build impl");

  const asc = require("assemblyscript/bin/asc");
  asc.main([
    "../out/main.near.ts",
    "--baseDir", "assembly",
    "--binaryFile", "../out/main.wasm",
    "--sourceMap",
    "--measure"
  ], callback);
});

gulp.task("default", ["build"]);

// This task is not required when running the project locally. Its purpose is to set up the
// AssemblyScript compiler when a new project has been loaded in WebAssembly Studio.
gulp.task("project:load", () => {
  const utils = require("@wasm/studio-utils");
  utils.eval(utils.project.getFile("setup.js").getData(), {
    logLn,
    project,
    monaco,
    fileTypeForExtension,
  });
});
