var gulp = require('gulp');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');

var log = require('fancy-log');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-function');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');
var easyimport = require('postcss-easy-import');

var swallowError = function swallowError(error) {
    log.error(error.toString());
    this.emit('end');
};

var nodemonServerInit = function () {
    livereload.listen(1234);
};

gulp.task('css', function () {
    var processors = [
        easyimport,
        customProperties,
        colorFunction(),
        autoprefixer({browsers: ['last 2 versions']}),
        cssnano()
    ];

    return gulp.src('assets/css/*.css')
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/'))
        .pipe(livereload());
});

gulp.task('js', function () {
    var jsFilter = filter(['**/*.js'], {restore: true});

    return gulp.src('assets/js/*.js')
        .on('error', swallowError)
        .pipe(sourcemaps.init())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/built/'))
        .pipe(livereload());
});

gulp.task('build', gulp.series(['css', 'js'], function (/* cb */) {
    return nodemonServerInit();
}));

gulp.task('generate', gulp.series(['css', 'js']));

gulp.task('watch', function () {
    gulp.watch('assets/css/**', ['css']);
});

gulp.task('zip', gulp.series(['css', 'js'], function () {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var version = require('./package.json').version;
    var filename = themeName + '-' + version + '.zip';

    return gulp.src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
}));

gulp.task('default', gulp.series(['build'], function () {
    gulp.start('watch');
}));
