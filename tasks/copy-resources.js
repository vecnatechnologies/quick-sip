const $ = require('gulp-load-plugins')({});
const _ = require('lodash');
const fs = require('fs');
const log = require('color-log');
const del = require('del');
const path = require('path');
const addWatchListeners = require('./utils/add-watch-listeners');

const INTELLIJ_TEMP_FILE_SUFFIX = '___jb_tmp___';

module.exports = function(gulp, options) {
  if (options.copy.skip) {
    return;
  }

  /* Copy all resources to dist */
  function copyResources() {
    const taskName = options.taskPrefix + 'copy-resources';
    const logPrefix = '['  + taskName + '] ';

    let bytes = 0;
    const startTime = +new Date();

    return gulp.src(options.copy.buildFullSrcArray())
      .pipe($.tap(function (file, callback) {
        bytes += fs.statSync(file.path).size;
        return callback;
      }))
      .pipe(gulp.dest(options.copy.dist))
      .on('end', function () {
        const endTime = +new Date();
        log.mark(logPrefix + bytes + ' bytes written (' + (endTime - startTime) / 1000.0 + ' seconds)');
      });
  }

  const copySrcPath = options.copy.src;

  /* Handle single resource events for watch */
  function copyResource(event, copySrcRelativePath) {
    const taskName = options.taskPrefix + 'copy-resources-watch-copy';
    const destPath = options.copy.dist;

    const intellijTempFile = copySrcRelativePath.endsWith(INTELLIJ_TEMP_FILE_SUFFIX);

    const srcFilePath = path.join(copySrcPath, copySrcRelativePath);
    const fileExists = fs.existsSync(srcFilePath);

    const destFilePath = path.join(destPath, copySrcRelativePath);

    if (event === 'change' && fileExists && !intellijTempFile) {
      return gulp.src(srcFilePath)
        .pipe(gulp.dest(destPath))
        .on('error', function(error) {
          log.error('[COPY: ' + taskName + '] ' + copySrcRelativePath + ' failed');
          log.error(srcFilePath + ' --> ' + destFilePath);
          log.error(error);
        })
        .on('end', function() {
          log.mark('[COPY: ' + taskName + '] ' + copySrcRelativePath + ' successful');
          log.info(srcFilePath + ' --> ' + destFilePath);
        });
    } else if (event === 'add' && fileExists && !intellijTempFile) {
      return gulp.src(srcFilePath)
        .pipe(gulp.dest(destPath))
        .on('error', function(error) {
          log.error('[ADD: ' + taskName + '] ' + copySrcRelativePath + ' failed');
          log.error(srcFilePath + ' --> ' + destFilePath);
          log.error(error);
        })
        .on('end', function() {
          log.mark('[ADD: ' + taskName + '] ' + copySrcRelativePath + ' successful');
          log.info(srcFilePath + ' --> ' + destFilePath);
        });
    } else if (event === 'unlink' && !intellijTempFile) {
      const removedLogPrefix = '[REMOVE: ' + taskName + '] ';
      del(destFilePath, { force: true })
        .then(function() {
          log.mark(removedLogPrefix + copySrcRelativePath + ' successful');
          log.info(destFilePath);
        }, function(error) {
          log.error(removedLogPrefix + copySrcRelativePath + ' failed');
          log.error(srcFilePath + ' --> ' + destFilePath);
          log.error(error);
        });
    } else if (intellijTempFile) {
      log.info('[IGNORED: ' + taskName + '] (' + event + ') temp intellij file: ' + copySrcRelativePath);
    } else if ((event === 'change' || event === 'add') && !fileExists) {
      log.warn('[IGNORED: ' + taskName + '] (' + event + ') file does not exist to copy or add: ' + srcFilePath);
    }
  }

  function copyResourcesWatch() {
    const taskName = options.taskPrefix + 'copy-resources-watch';
    const logPrefix = '['  + taskName + '] ';

    const copyWatcher = gulp.watch('**/*', {
      ignored: '**/*.+(' + options.copy.excludes +')',
      cwd: copySrcPath
    });
    copyWatcher.on('ready', function() {
      log.info(logPrefix + 'copy watch ready!');
    });
    copyWatcher.on('all', copyResource);
    addWatchListeners(copyWatcher, logPrefix);
    return copyWatcher;
  }

  return {
    build: copyResources,
    watch: gulp.series(copyResources, copyResourcesWatch)
  };
};