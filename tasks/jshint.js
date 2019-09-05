const $ = require('gulp-load-plugins')({});
const stylish = require('jshint-stylish');
const log = require('color-log');
const _ = require('lodash');
const path = require('path');
const addWatchListeners = require('./utils/add-watch-listeners');

module.exports = function(gulp, options) {
  if (options.jshint.skip) {
    return;
  }

  function jshint() {
    const taskName = options.taskPrefix + 'jshint';
    const logPrefix = '['  + taskName + '] ';

    const jshintSrcGlob = path.join(options.jshint.src, options.jshint.globRelativeToSrc);
    log.mark(logPrefix + 'running jshint on ' + jshintSrcGlob);

    if (_.isEmpty(options.jshint.config)) {
      log.mark(logPrefix + 'using default configuration');
    } else {
      log.mark(logPrefix + 'using custom configuration');
    }

    let hintTask = gulp.src(jshintSrcGlob)
      .pipe($.jshint(options.jshint.config))
      .pipe($.jshint.reporter(stylish));

    if (options.jshint.stopOnFail) {
      hintTask = hintTask.pipe($.jshint.reporter('fail'));
    }

    return hintTask;
  }

  const jshintTask = gulp.series(jshint);

  function jshintWatch() {
    const taskName = options.taskPrefix + 'jshint-watch';
    const logPrefix = '['  + taskName + '] ';

    const jshintWatcher = gulp.watch(options.jshint.globRelativeToSrc, {
      cwd: options.jshint.src
    }, jshintTask);
    jshintWatcher.on('ready', function() {
      log.info(logPrefix + 'jshint watch ready!');
    });
    addWatchListeners(jshintWatcher, logPrefix);
    return jshintWatcher;
  }

  return {
    build: jshint,
    watch: gulp.series(jshint, jshintWatch)
  };
};
