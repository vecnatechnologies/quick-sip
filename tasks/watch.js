var $ = require('gulp-load-plugins')({});
var del = require('del');
var log = require('color-log');
var pathLib = require('path');
var createBundleTasks = require('./utils/createBundleTasks');

module.exports = function(gulp, options) {
  var tasks = createBundleTasks(gulp, options);
  var taskName = options.taskPrefix + 'watch';

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

  /* Watch build */
  gulp.task(, function() {
    var buildTasks = [];

    if (!options.styles.skip) {
      buildTasks.push(options.taskPrefix + 'build-styles');
      gulp.watch(options.styles.src + '/**/*.scss', [options.taskPrefix + 'build-styles']);
    }

    if (!options.copy.skip) {
      buildTasks.push(options.taskPrefix + 'copy-resources');
      gulp.watch([
        options.copy.src + '/**/*.*',
        '!' + options.copy.src + '/**/*.+(' + options.copy.excludes +')',
      ], copyResource);
    }

    if (!options.browserify.skip) {
      buildTasks.push(options.taskPrefix + 'build-app');
      tasks.browserify.createWatchifyBundler();
    }

    if (!options.jshint.skip) {
      gulp.watch(options.jshint.src, gulp.series(options.taskPrefix + 'jshint'));
    }

    if (options.clean.skip) {
      return gulp.series(options.taskPrefix + 'jshint', buildTasks)(callback);
    } else {
      return gulp.series(options.taskPrefix + 'jshint', options.taskPrefix + 'clean', buildTasks)(callback);
    }
  });
};
