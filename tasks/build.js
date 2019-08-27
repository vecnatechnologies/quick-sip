var log = require('color-log');
var createBundleTasks = require('./utils/createBundleTasks');

module.exports = function(gulp, options) {
  var tasks = createBundleTasks(gulp, options);

  function build() {
    var buildTasks = [];
    function browserifyCompleteFn(callback) {
      log.mark('[BROWSERIFY] complete!');
      callback();
    }

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
      return gulp.series(options.taskPrefix + 'jshint', buildTasks, browserifyCompleteFn);
    } else {
      return gulp.series(options.taskPrefix + 'jshint', options.taskPrefix + 'clean', buildTasks, browserifyCompleteFn);
    }
  }

  /* Full build */
  gulp.task(options.taskPrefix + 'build', build);

  // Alias default to do the build.  After this file is run the default task can be overridden if desired.
  gulp.task('default', build);
};
