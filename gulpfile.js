const gulp = require("gulp");

gulp.task("build:model",  function (done) {
  const asc = require("assemblyscript/bin/asc");
  asc.main([
    "model.ts",
    "--baseDir", "./out",
    "--nearFile", "../out/model.near.ts",
    "--measure"
  ], done);
});

gulp.task("build:bindings",  function (done) {
  console.log('bb1')
  const asc = require('assemblyscript/bin/asc');
  asc.main([
    "main.ts",
    "--baseDir", "./out",
    "--binaryFile", "../out/main.wasm",
    "--nearFile", "../out/main.near.ts",
    "--measure"
  ], done);
});

gulp.task("build:all", gulp.series('build:model', 'build:bindings', function (done) {
  done();
}));

gulp.task('copyfiles', function(done) {
  return gulp.src('./assembly/**/*')
      .pipe(gulp.dest('./out/'));
});

gulp.task('build', gulp.series('copyfiles', 'build:all', function(done) {
  done();
}));
