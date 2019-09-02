var $ = require('gulp-load-plugins')({});
var _ = require('lodash');
var log = require('color-log');
var watchify = require('watchify');
var browserify = require('browserify');
var currentDateTime = require('./utils/currentDateTime');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var minimist = require('minimist');

var PRODUCTION_BUILD_TYPE = 'production';

module.exports = function(gulp, options) {
  var taskName = options.taskPrefix + 'build-app';
  var logPrefix = '['  + taskName + '] ';
  var argv = minimist(process.argv.slice(2));
  var buildType = argv.type;
  var rootFileToBrowserify = options.browserify.root;
  if (!rootFileToBrowserify.endsWith('.js')) {
    rootFileToBrowserify += '.js';
  }
  var browserifyDestination = options.browserify.dist;

  var browserifyBundler;

  function generateBrowserifyArguments() {
    log.info(logPrefix + 'browserifying: ' + rootFileToBrowserify + ' --> ' + browserifyDestination);
    var browserifyArgs = _.clone(watchify.args);
    browserifyArgs.debug = options.browserify.debug;
    if (!browserifyArgs.entries) {
      browserifyArgs.entries = [];
    }
    browserifyArgs.entries.push(rootFileToBrowserify);
    return browserifyArgs;
  }

  function configureBrowserify(configureBrowserifyBundler) {
    options.browserify.transforms.forEach(function(transform) {
      if (transform.transform) {
        configureBrowserifyBundler.transform(transform.transform, transform.options);
      } else {
        configureBrowserifyBundler.transform(transform);
      }
    });
  }

  /* Actually bundle the stuff being browserified */
  /* Reduce all javascript to app.js */
  function bundle() {
    var pipe = browserifyBundler.bundle();
    pipe = pipe.on('error', function(err) {
      delete err.stream;
      log.error(logPrefix + ' @ ' + currentDateTime());
      log.warn(err.toString());
      if (!browserifyBundler.continueOnError && options.browserify.failOnError) {
        throw err;
      }
      return true;
    });
    pipe = pipe.pipe(source(options.browserify.out));
    pipe = pipe.pipe(buffer());

    if (buildType !== PRODUCTION_BUILD_TYPE) {
      pipe = pipe.pipe($.sourcemaps.init({loadMaps: true}));
    }
    if (buildType === PRODUCTION_BUILD_TYPE) {
      pipe = pipe.pipe($.uglify());
    }
    if (buildType !== PRODUCTION_BUILD_TYPE) {
      pipe = pipe.pipe($.sourcemaps.write('./'));
    }
    return pipe.pipe(gulp.dest(browserifyDestination));
  }

  if (!options.browserify.skip) {
    /* Reduce all javascript to app.js */
    gulp.task(taskName, bundle);
  }

  return {
    createBundler: function() {
      var browserifyArgs = generateBrowserifyArguments();
      log.info('Browserify args: ' + JSON.stringify(browserifyArgs));
      browserifyBundler = browserify(browserifyArgs);
      configureBrowserify(browserifyBundler);
      browserifyBundler.on('log', function(data) {
        log.mark(logPrefix + data.toString());
      });
      return browserifyBundler;
    },

    createWatchifyBundler: function() {
      var browserifyArgs = generateBrowserifyArguments();
      log.info('Watchify args: ' + JSON.stringify(browserifyArgs));
      browserifyBundler = browserify(browserifyArgs);
      browserifyBundler = watchify(browserifyBundler);
      browserifyBundler.continueOnError = true;
      configureBrowserify(browserifyBundler);
      browserifyBundler.on('update', bundle);
      browserifyBundler.on('update', function(changedFile) {
        log.mark(logPrefix + 'browserifying: ' + changedFile + ' ...');
      });
      browserifyBundler.on('log', function(data) {
        log.mark(logPrefix + data.toString());
      });
      return browserifyBundler;
    }
  };
};