var $ = require('gulp-load-plugins')({});
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

  var browserifyBundler;

  function configureBrowserify(configureBrowserifyBundler) {
    configureBrowserifyBundler.add(options.browserify.root);
    options.browserify.transforms.forEach(function(transform) {
      if (transform.transform) {
        configureBrowserifyBundler.transform(transform.transform, transform.options);
      } else {
        configureBrowserifyBundler.transform(transform);
      }
    });
  }

  /* Reduce all javascript to app.js */
  function buildApp() {
    var argv = minimist(process.argv.slice(2));
    var buildType = argv.type;
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
    return pipe.pipe(gulp.dest(options.browserify.dist));
  }

  if (!options.browserify.skip) {
    /* Reduce all javascript to app.js */
    gulp.task(taskName, buildApp);
  }

  return {
    createBundler: function() {
      watchify.args.debug = options.browserify.debug;
      browserifyBundler = browserify(watchify.args);
      configureBrowserify(browserifyBundler);
      return browserifyBundler;
    },

    createWatchifyBundler: function() {
      watchify.args.debug = options.browserify.debug;
      browserifyBundler = watchify(browserify(watchify.args));
      browserifyBundler.continueOnError = true;
      configureBrowserify(browserifyBundler);
      browserifyBundler.on('update', buildApp);
      browserifyBundler.on('log', function(data) {
        log.mark(logPrefix + data.toString());
      });
      return browserifyBundler;
    }
  };
};