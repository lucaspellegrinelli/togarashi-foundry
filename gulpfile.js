const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");

sass.compiler = require("node-sass");
gulp.task("sass", function () {
   return gulp.src("./scss/**/*.scss")
   .pipe(concat("togarashi.scss"))
   .pipe(sass().on("error", sass.logError))
   .pipe(gulp.dest("./"));
});
