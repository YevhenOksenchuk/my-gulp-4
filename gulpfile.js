'use strict';

const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const rimraf = require('rimraf');
const browserSync = require("browser-sync").create();
const rename = require('gulp-rename');
const spritesmith = require('gulp.spritesmith');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');


/* -------- Server  -------- */
gulp.task('server', function () {
    browserSync.init({
        server: {
            port: 9000,
            baseDir: "build"
        }
    });

    gulp.watch('build/**/*').on('change', browserSync.reload);
});

//----------SASS------------
gulp.task('styles:compile', function () {
    return gulp.src('src/styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths,
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'));
});

/* ------------Rigger--------------- */
gulp.task('rigger', function (done) {
    gulp.src('src/template/main.html')
        .pipe(sourcemaps.init())
        .pipe(rigger())
        .pipe(rename('index.html'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/'));
    done()
});


/* -------------js------------ */
gulp.task('scripts', () =>
    gulp.src('src/scripts/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js/'))
);


/* ------------ Sprite ------------- */
gulp.task('sprite', function (cb) {
    const spriteData = gulp.src('src/images/icons/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../images/sprite.png',
        cssName: 'sprite.scss'
    }));

    spriteData.img.pipe(gulp.dest('build/images/'));
    spriteData.css.pipe(gulp.dest('src/styles/global/'));
    cb();
});

/* ------------ Delete ------------- */
gulp.task('clean', function del(cb) {
    return rimraf('build', cb);
});



/* ------------ Copy fonts ------------- */
gulp.task('copy:fonts', function () {
    return gulp.src('./src/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts'));
});

/* ------------ Copy images ------------- */
gulp.task('copy:images', function () {
    return gulp.src('./src/images/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/images'));
});

/* ------------ Copy ------------- */
gulp.task('copy', gulp.parallel('copy:fonts', 'copy:images'));

/* ------------ Watchers ------------- */
gulp.task('watch', function () {
    gulp.watch('src/template/**/*.html', gulp.series('rigger'));
    gulp.watch('src/styles/**/*.scss', gulp.series('styles:compile'));
    gulp.watch('src/scripts/**/*.js', gulp.series('scripts'));
});

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('rigger', 'styles:compile', 'scripts', 'sprite', 'copy'),
    gulp.parallel('watch', 'server')
));