var $ = require('gulp-load-plugins')({});
var fs = require('fs');
var log = require('color-log');

module.exports = function(gulp, options) {
  if (!options.copy.skip) {
    /* Copy all resources to dist */
    var taskName = options.taskPrefix + 'copy-resources';
    var logPrefix = '[' + taskName + '] ';

    function copyResources(done) {
      var bytes = 0;
      var startTime = +new Date();

      return gulp.src(options.copy.buildFullSrcArray())
        .pipe($.tap(function(file, callback) {
          bytes += fs.statSync(file.path).size;
          return callback;
        }))
        .pipe(gulp.dest(options.copy.dist))
        .pipe($.concat('tmp'))
        .pipe($.tap(function() {
          var endTime = +new Date();
          log.mark(logPrefix + bytes + ' bytes written (' + (endTime - startTime)/1000.0 + ' seconds)');
        }));
    }
    gulp.task(taskName, copyResources);
  }
};