var $ = require('gulp-load-plugins')({});
var _ = require('lodash');
var del = require('del');
var log = require('color-log');
var pathLib = require('path');
var createBundleTasks = require('./utils/createBundleTasks');

module.exports = function(gulp, options) {
  var tasks = createBundleTasks(gulp, options);
  var taskName = options.taskPrefix + 'watch';

  function createWatchifyBundler(done) {
    tasks.browserify.createWatchifyBundler();
    done();
  }

  /* Handle single resource events for watch */
  function copyResource(evt, callback) {
    var status = evt.type;
    var srcPath = evt.path;
    var copySrcPath = options.copy.src;
    var destPath = options.copy.dist;

    if (!pathLib.isAbsolute(destPath)) {
      destPath = './' + destPath;
    }
    if (!pathLib.isAbsolute(copySrcPath)) {
      copySrcPath = './' + copySrcPath;
    }
    var relPath = pathLib.relative(copySrcPath, srcPath);

    if (status === 'changed') {
      log.mark('[MODIFY: ' + taskName + '] --> ' + relPath);
      return gulp.src(srcPath)
        .pipe($.concat(relPath))
        .pipe(gulp.dest(destPath));
    } else if (status === 'added') {
      log.mark('[ADDED: ' + taskName + '] --> ' + relPath);
      return gulp.src(srcPath)
        .pipe($.concat(relPath))
        .pipe(gulp.dest(destPath));
    } else if (status === 'renamed') {
      log.mark('[RENAMED: ' + taskName + '] --> ' + relPath);
      return gulp.src(srcPath)
        .pipe($.concat(relPath))
        .pipe(gulp.dest(destPath));
    } else if (status === 'deleted') {
      log.mark('[DELETED: ' + taskName + '] --> ' + relPath);
      del(destPath + '/' + relPath, callback);
    }
  }

  var buildParallelTasks = [];
  var buildSeriesTasks = [];
  if (!options.styles.skip) {
    buildParallelTasks.push(options.taskPrefix + 'build-styles');
  }

  if (!options.copy.skip) {
    buildParallelTasks.push(options.taskPrefix + 'copy-resources');
  }

  if (!options.browserify.skip) {
    buildSeriesTasks.push(createWatchifyBundler);
  }

  buildSeriesTasks.push(options.taskPrefix + 'jshint');

  if (!options.clean.skip) {
    buildSeriesTasks.push(options.taskPrefix + 'clean');
  }

  if (!_.isEmpty(buildParallelTasks)) {
    buildSeriesTasks.push(gulp.parallel(buildParallelTasks));
  }

  function watchBuild() {
    if (!options.styles.skip) {
      gulp.watch(options.styles.src + '/**/*.scss', gulp.series(options.taskPrefix + 'build-styles'));
    }

    if (!options.copy.skip) {
      gulp.watch([
        options.copy.src + '/**/*.*',
        '!' + options.copy.src + '/**/*.+(' + options.copy.excludes +')',
      ], copyResource);
    }

    if (!options.jshint.skip) {
      gulp.watch(options.jshint.src, gulp.series(options.taskPrefix + 'jshint'));
    }
  }
  buildSeriesTasks.push(watchBuild);

  var allGulpWatchTasks = gulp.series(buildSeriesTasks);

  /* Watch build */
  gulp.task(taskName, allGulpWatchTasks);
};
