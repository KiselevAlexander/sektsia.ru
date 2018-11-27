'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    babel = require('gulp-babel'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    notify = require("gulp-notify"),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    htmlInjector = require("bs-html-injector"),
    inline_image = require('gulp-base64-image'),
    fileinclude = require('gulp-file-include'),
    rollup = require('gulp-rollup'),
    htmlmin = require('gulp-htmlmin'),
    htmlbeautify = require('gulp-html-beautify');


var PUBLIC_DIR = 'public';

var path = {
    build: {
        html: PUBLIC_DIR + '/',
        assets: PUBLIC_DIR + '/assets/',
        js: PUBLIC_DIR + '/js/',
        css: PUBLIC_DIR + '/css/',
        pageStyle: PUBLIC_DIR + '/css/pages/',
        img: PUBLIC_DIR + '/img/',
        fonts: PUBLIC_DIR + '/fonts/',
        pages: PUBLIC_DIR + '/pages/',
        php: PUBLIC_DIR + '/php/'
    },
    src: {
        html: 'src/**/*.html',
        assets: 'src/assets/**/*.*',
        js: 'src/js/**/*.js',
        style: 'src/scss/**/*.scss',
        pageStyle: 'src/scss/pages/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        php: 'src/php/**/*.php',
        pages: 'src/pages/*'
    },
    watch: {
        html: 'src/**/*.(html|htm)',
        assets: 'src/assets/**/*.*',
        js: 'src/js/**/*.js',
        style: ['src/scss/**/*.scss', '!src/scss/pages/*.scss'],
        pageStyle: 'src/scss/pages/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        php: 'src/php/**/*.php',
        pages: 'src/pages/*.htm'
    },
    clean: './public'
};

const config = {
    server: {
        baseDir: "./public"
    },
    tunnel: false,
    host: 'localhost',
    port: 3001,
    logPrefix: "Mining",
    open: false
};


gulp.task('webserver', function () {
    browserSync.use(htmlInjector, {
        files: "src/*.html"
    });
    browserSync.init(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html).pipe(rigger()
            .on("error", notify.onError(function (error) {
                return "Error rigger: " + error.message;
            })))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            context: {
                logo: ''
            }
        })
            .on("error", notify.onError(function (error) {
                return "Error: " + error.message;
            })))
        // .pipe(htmlmin({
        //     collapseWhitespace: true,
        //     removeComments: true,
        //     minifyJS: true
        // }))
        .pipe(htmlbeautify({
            indentSize: 4
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('assets:build', function () {
    gulp.src(path.src.assets)
        .pipe(gulp.dest(path.build.assets))
        .pipe(reload({stream: true}));
});

gulp.task('pages:build', function () {
    gulp.src(path.src.pages)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.pages))
        .pipe(reload({stream: true}));
});


/**
 * JAVASCRIPT
 */

const fs = require('fs');
const babelify = require('babelify');
const envify = require('envify/custom');
const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'));
const babelifyPresets = babelify.configure(babelrc);
const browserify = require('browserify');
const rename = require('gulp-rename');
const buffer = require('gulp-buffer');
const streamify = require('gulp-streamify');
const source = require('vinyl-source-stream');

const buildAppTask = (dest) => () => {
    const b = browserify('src/js/app.js', {
        transform: [babelifyPresets],
        bundleExternal: false
    }).transform(envify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        DEBUG: false
    }), {
        global: true
    });

    let stream = b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source('script.js'))
        .pipe(rename({
            suffix: '.bundle'
        }))
        .pipe(reload({stream: true}));

    if (process.env.NODE_ENV === 'production') {
        stream = stream.pipe(streamify(uglify()));
    }

    stream.pipe(gulp.dest(dest))
        .on('error', (e) => console.error(e));

    return stream;
};

gulp.task('js:build', buildAppTask('public/js/'));

const libs = [];

const vendorTask = (dest) => () => {
    const vendor = 'vendor.js';
    const b = browserify();

    libs.forEach((lib) => {
        b.require(lib, {
            expose: lib
        });
    });

    let stream = b.bundle()
        .on('error', console.error.bind(console))
        .pipe(source(vendor))
        .pipe(rename({
            suffix: '.bundle'
        }));

    if (process.env.NODE_ENV === 'production') {
        stream = stream.pipe(streamify(uglify()));
    }

    stream.pipe(gulp.dest(dest))
        .on('error', (e) => console.error(e));

    return stream;
};

gulp.task('vendors', vendorTask('public/js/'));



gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
                includePaths: ['src/scss/'],
                // outputStyle: 'compressed',
                sourceMap: true,
                errLogToConsole: true,
                functions: inline_image({url:'src/img/'})
            })
                .on("error", notify.onError(function (error) {
                    return "Error: " + error.message;
                }))
        )
        .pipe(prefixer())
        // .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('pageStyle', function () {
    gulp.src(path.src.pageStyle)
        .pipe(sourcemaps.init())
        .pipe(sass({
                includePaths: ['src/scss/'],
                outputStyle: 'compressed',
                sourceMap: true,
                errLogToConsole: true,
                functions: inline_image({url:'src/img/'})
            })
                .on("error", notify.onError(function (error) {
                    return "Error: " + error.message;
                }))
        )
        .pipe(prefixer())
        // .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.pageStyle))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
    /*.pipe(imagemin({
     progressive: true,
     svgoPlugins: [{removeViewBox: false}],
     use: [pngquant()],
     interlaced: true
     }))*/
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('php:build', function() {
    gulp.src(path.src.php)
        .pipe(gulp.dest(path.build.php))
});

gulp.task('build', [
    'html:build',
    'assets:build',
    'vendors',
    'js:build',
    'style:build',
    'pageStyle',
    'fonts:build',
    'pages:build',
    'image:build',
    'php:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.pages], function(event, cb) {
        gulp.start('assets:build');
    });
    watch([path.watch.pages], function(event, cb) {
        gulp.start('pages:build');
    });
    watch(path.watch.style, function(event, cb) {
        setTimeout(function(){
            gulp.start('style:build');
        }, 500);
    });
    watch([path.watch.pageStyle], function(event, cb) {
        setTimeout(function(){
            gulp.start('pageStyle');
        }, 500);
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.php], function(event, cb) {
        gulp.start('php:build');
    });
});

gulp.task("default", ['build', 'webserver', 'watch'], function () {
   // gulp.watch("test/fixtures/*.html", htmlInjector);
});