var jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    log = require('color-log')
    _ = require('lodash');

module.exports = function(gulp, options) {
  gulp.task(options.taskPrefix + 'jshint', function() {
    if (options.jshint.skip) {
      log.mark('[JSHINT] skipped ...');
    } else {
      log.mark('[JSHINT] running jshint on ' + options.jshint.src);

      if (_.isEmpty(options.jshint.config)) {
        log.mark('[JSHINT] using default configuration');
      } else {
        log.mark('[JSHINT] using custom configuration');
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
