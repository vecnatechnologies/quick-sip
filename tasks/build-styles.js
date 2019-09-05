const $ = require('gulp-load-plugins')({});
const log = require('color-log');
const currentDateTime = require('./utils/currentDateTime');
const addWatchListeners = require('./utils/add-watch-listeners');
const minimist = require('minimist');

const PRODUCTION_BUILD_TYPE = 'production';
const argv = minimist(process.argv.slice(2));
const buildType = argv.type;

module.exports = function(gulp, options) {
  if (options.styles.skip) {
    return;
  }

  /* Build all styles */
  function copyStyles() {
    const taskName = options.taskPrefix + 'build-styles';
    const logPrefix = '['  + taskName + '] ';

    let pipe = gulp.src(options.styles.root)
      .pipe($.sass({
        file: options.styles.root,
        includePaths: options.styles.includes
      })
        .on('data', function (data) {
          log.mark(logPrefix + data.contents.length + ' bytes written');
        })
        .on('error', function (err) {
          log.error(logPrefix + ' @ ' + currentDateTime());
          log.warn(logPrefix + 'File: [line:' + err.line + ', col:' + err.column + '] ' + err.file);
          log.warn(logPrefix + 'Message: ' + err.message);
          this.emit('end');
        }))
      .pipe($.autoprefixer());

    if (buildType === PRODUCTION_BUILD_TYPE) {
      pipe = pipe.pipe($.cssmin())
    }

    return pipe.pipe(gulp.dest(options.styles.dist));
  }

  function watchStyles() {
    const taskName = options.taskPrefix + 'styles-watch';
    const logPrefix = '['  + taskName + '] ';

    let stylesWatcher = gulp.watch('**/*.scss', {
      cwd: options.styles.src
    }, gulp.series(copyStyles));
    stylesWatcher.on('ready', function () {
      log.info(logPrefix + 'styles watch ready!');
    });
    addWatchListeners(stylesWatcher, logPrefix);
  }

  return {
    build: copyStyles,
    watch: gulp.series(copyStyles, watchStyles)
  };
};
