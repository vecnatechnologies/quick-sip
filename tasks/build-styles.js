var $ = require('gulp-load-plugins')({});
var log = require('color-log');
var currentDateTime = require('./utils/currentDateTime');
var minimist = require('minimist');

var PRODUCTION_BUILD_TYPE = 'production';

module.exports = function(gulp, options) {

  if (!options.styles.skip) {
    /* Build all styles */
    gulp.task(options.taskPrefix + 'build-styles', function() {
      var argv = minimist(process.argv.slice(2));
      var buildType = argv.type;
      var pipe = gulp.src(options.styles.root)
        .pipe($.sass({
          file: options.styles.root,
          includePaths: options.styles.includes
        })
          .on('data', function(data) {
            log.mark('[SASS] ' + data.contents.length + ' bytes written');
          })
          .on('error', function(err) {
            log.error('[SASS] @ ' + currentDateTime());
            log.warn('File: [line:' + err.line + ', col:' + err.column + '] ' + err.file);
            log.warn('Message: ' + err.message);
            this.emit('end');
          }))
        .pipe($.autoprefixer());

      if (buildType === PRODUCTION_BUILD_TYPE) {
        pipe = pipe.pipe($.cssmin())
      }

      pipe = pipe.pipe(gulp.dest(options.styles.dist));
      return pipe;
    });
  }
};
