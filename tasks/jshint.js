var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var log = require('color-log');
var _ = require('lodash');

module.exports = function(gulp, options) {
  var taskName = options.taskPrefix + 'jshint';
  var logPrefix = '['  + taskName + '] ';
  gulp.task(taskName, function(jshintDone) {
    if (options.jshint.skip) {
      log.mark(logPrefix + 'skipped ...');
      jshintDone();
    } else {
      log.mark(logPrefix + 'running jshint on ' + options.jshint.src);

      if (_.isEmpty(options.jshint.config)) {
        log.mark(logPrefix + 'using default configuration');
      } else {
        log.mark(logPrefix + 'using custom configuration');
      }

      var hintTask = gulp.src(options.jshint.src)
        .pipe(jshint(options.jshint.config))
        .pipe(jshint.reporter(stylish));

      if (options.jshint.stopOnFail) {
        hintTask = hintTask.pipe(jshint.reporter('fail'));
      }

      return hintTask
    }
  });
};
