var log = require('color-log');
var createBundleTasks = require('./utils/createBundleTasks');

module.exports = function(gulp, options) {
  var taskName = options.taskPrefix + 'build';
  var logPrefix = '['  + taskName + '] ';
  var tasks = createBundleTasks(gulp, options);

  function browserifyCompleteFn(done) {
    log.mark(logPrefix + 'complete!');
    done();
  }

  var buildParallelTasks = [];
  if (!options.styles.skip) {
    buildParallelTasks.push(options.taskPrefix + 'build-styles');
  }

  if (!options.copy.skip) {
    buildParallelTasks.push(options.taskPrefix + 'copy-resources');
  }

  if (!options.browserify.skip) {
    buildParallelTasks.push(options.taskPrefix + 'build-app');
    tasks.browserify.createBundler();
  }

  var buildSeriesTasks = [ options.taskPrefix + 'jshint' ];

  if (!options.clean.skip) {
    buildSeriesTasks.push(options.taskPrefix + 'clean');
  }

  buildSeriesTasks.push(gulp.parallel(buildParallelTasks));
  buildSeriesTasks.push(browserifyCompleteFn);

  log.mark('SERIES: ' + buildSeriesTasks);
  log.mark('PARALLEL: ' + buildParallelTasks);
  var allGulpBuildTasks = gulp.series(buildSeriesTasks);

  /* Full build */
  gulp.task(taskName, allGulpBuildTasks);

  // Alias default to do the build.  After this file is run the default task can be overridden if desired.
  gulp.task('default', allGulpBuildTasks);
};
