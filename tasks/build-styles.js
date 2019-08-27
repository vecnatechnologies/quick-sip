var $ = require('gulp-load-plugins')({});
var log = require('color-log');
var currentDateTime = require('./utils/currentDateTime');
var minimist = require('minimist');

var PRODUCTION_BUILD_TYPE = 'production';

module.exports = function(gulp, options) {

  if (!options.styles.skip) {
    /* Build all styles */
    var taskName = options.taskPrefix + 'build-styles';
    var logPrefix = '['  + taskName + '] ';
    gulp.task(taskName, function() {
      var argv = minimist(process.argv.slice(2));
      var buildType = argv.type;
      var pipe = gulp.src(options.styles.root)
        .pipe($.sass({
          file: options.styles.root,
          includePaths: options.styles.includes
        })
          .on('data', function(data) {
            log.mark(logPrefix + data.contents.length + ' bytes written');
          })
          .on('error', function(err) {
            log.error(logPrefix + ' @ ' + currentDateTime());
            log.warn(logPrefix + 'File: [line:' + err.line + ', col:' + err.column + '] ' + err.file);
            log.warn(logPrefix + 'Message: ' + err.message);
            this.emit('end');
          }))
        .pipe($.autoprefixer());

      if (buildType === PRODUCTION_BUILD_TYPE) {
        pipe = pipe.pipe($.cssmin())
      }

      return pipe.pipe(gulp.dest(options.styles.dist));
    });
  }
};
