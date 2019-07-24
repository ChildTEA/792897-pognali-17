"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var stylelint = require("gulp-lintspaces");
var editorconfig = require("gulp-lintspaces");
var server = require("browser-sync").create();
var editorconfigPaths = require("./package.json")["editorconfig-cli"];

gulp.task("editorconfig", function () {
  return gulp.src(editorconfigPaths)
    .pipe(plumber())
    .pipe(editorconfig({ editorconfig: '.editorconfig' }))
    .pipe(editorconfig.reporter());
});

gulp.task("stylelint", function () {
  return gulp.src("source/sass/**/*.scss")
    .pipe(plumber())
    .pipe(stylelint({
      reporters: [
        {
          console: true,
          formater: "string"
        }
      ]
    }));
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass({
      includePaths: require("node-normalize-scss").includePaths
    }
    ))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("stylelint", "css"));
  gulp.watch(editorconfigPaths, gulp.series("editorconfig", "reload"));
});

gulp.task("reload", function (done) {
  server.reload();
  done();
});

gulp.task("start", gulp.series("editorconfig", "stylelint", "css", "server"));
