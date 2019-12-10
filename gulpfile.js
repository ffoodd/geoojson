'use strict';

const gulp     = require('gulp');
const options  = require('./tasks/options');
const browser  = require('browser-sync').create();
const del      = require('del');



/**
 * @section Docs
 */
function clean() {
    return del(options.paths.docs + '/*');
}

exports.clean = clean;
gulp.task('compile', require('./tasks/compile'));
gulp.task('sri',     require('./tasks/sri'));
gulp.task('package', gulp.series( clean, gulp.parallel( 'compile' ), 'sri'));


/**
 * @section Sync
 */
function reload(done) {
    browser.reload();
    done();
}

function sync(done) {
    browser.init({
      server: {
         baseDir: options.paths.docs
       },
       https: true,
       cors: true
    });
    done();
}


/**
 * @section Watch
 */
function watch() {
  gulp.watch( options.paths.src + 'scss/**/*.scss',   gulp.series( 'compile', 'sri', reload ) );
  gulp.watch( options.paths.src + 'js/**/*.js',       gulp.series( 'compile', 'sri', reload ) );
  gulp.watch( options.paths.src + 'templates/*.html', gulp.series( 'compile', reload ) );
}
exports.watch   = watch;
exports.default = gulp.series( 'compile', 'sri', sync, watch );


/**
 * @section Test
 */
gulp.task('test', require('./tasks/tests'));


/**
 * @section Lint
 */
 gulp.task('lint', require('./tasks/lint'));


/**
 * @section Travis
 */
gulp.task('travis', require('./tasks/travis'));
