var log = require('color-log');
var createBundleTasks = require('./utils/createBundleTasks');

module.exports = function(gulp, options) {
  var tasks = createBundleTasks(gulp, options);

  function build(callback) {
    var buildTasks = [];
    var browserifyCompleteFn = function() {
        log.mark('[BROWSERIFY] complete!');
        callback();
      };

    if (!options.styles.skip) {
      buildTasks.push(options.taskPrefix + 'build-styles');
    }

    if (!options.copy.skip) {
      buildTasks.push(options.taskPrefix + 'copy-resources');
    }

    if (!options.browserify.skip) {
      buildTasks.push(options.taskPrefix + 'build-app');
      tasks.browserify.createBundler();
    }

    if (options.clean.skip) {
      return gulp.series(options.taskPrefix + 'jshint', buildTasks, browserifyCompleteFn)(callback);
    } else {
      return gulp.series(options.taskPrefix + 'jshint', options.taskPrefix + 'clean', buildTasks, browserifyCompleteFn)(callback);
    }
  }

  /* Full build */
  gulp.task(options.taskPrefix + 'build', build);

  // Alias default to do the build.  After this file is run the default task can be overridden if desired.
  gulp.task('default', build);
};
