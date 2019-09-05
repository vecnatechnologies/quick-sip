const $ = require('gulp-load-plugins')({});
const _ = require('lodash');
const log = require('color-log');
const watchify = require('watchify');
const browserify = require('browserify');
const currentDateTime = require('./utils/currentDateTime');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const path = require('path');

const JS_EXTENSION = '.js';

module.exports = function(gulp, options) {
  if (options.browserify.skip) {
    return;
  }

  return {
    build: createBrowserifyTask(gulp, options.taskPrefix, options.browserify, false),
    watch: createBrowserifyTask(gulp, options.taskPrefix, options.browserify, true)
  };
};

function createBrowserifyTask(gulp, taskPrefix, options, isWatch) {
  options = normalizeOptions(taskPrefix, options, isWatch);

  const browserifyArgs = generateBrowserifyArguments(options);
  const bundler = browserify(browserifyArgs);
  const bundleTask = createBundleTaskFxn(gulp, bundler, options);
  configureBrowserify(bundler, bundleTask, options);

  return bundleTask;
}

function normalizeOptions(taskPrefix, options, isWatch) {
  let taskName = taskPrefix + 'build-app';
  if (isWatch) {
    taskName += '-watch';
  }
  const logPrefix = '['  + taskName + '] ';

  let root = options.root;
  if (!root.endsWith(JS_EXTENSION)) {
    root += JS_EXTENSION;
  }

  const bundleFileName = path.basename(options.out);

  const normalizedOptions = {
    isWatch: isWatch,
    root: root,
    taskName: taskName,
    logPrefix: logPrefix,
    bundleFileName: bundleFileName
  };

  return _.defaultsDeep(normalizedOptions, options);
}

function generateBrowserifyArguments(options) {
  const browserifyArgs = _.clone(watchify.args);
  browserifyArgs.debug = options.debug;
  browserifyArgs.entries = options.root;
  return browserifyArgs;
}

function configureBrowserify(bundler, bundleTask, options) {
  if (options.isWatch) {
    watchifyBundler(bundler, bundleTask, options);
  }

  options.transforms.forEach(function(transform) {
    if (transform.transform) {
      bundler.transform(transform.transform, transform.options);
    } else {
      bundler.transform(transform);
    }
  });
  bundler.on('log', function(data) {
    log.mark(options.logPrefix + options.bundleFileName + ' ' + data.toString());
  });
}

function watchifyBundler(bundler, bundleTask, options) {
  bundler = watchify(bundler);
  bundler.continueOnError = true;

  bundler.on('update', function(changedFile) {
    log.mark(options.logPrefix + 'browserifying ' + options.bundleFileName);
    log.info(options.logPrefix + '  ' + changedFile)
  });
  bundler.on('update', bundleTask);
  bundler.on('ready', function() {
    log.mark(options.logPrefix + 'watchify ready!');
  });
}

function createBundleTaskFxn(gulp, bundler, options) {
  /* Actually bundle the stuff being browserified */
  /* Reduce all javascript to app.js */
  function bundleTask() {
    const taskVerb = options.isWatch ? 'watchifying' : 'browserifying';
    log.mark(options.logPrefix + taskVerb + ': ' + options.bundleFileName);
    const fullOutPath = path.join(options.dist, options.out);
    log.info(options.root + ' --> ' + fullOutPath);

    let bundle = bundler.bundle();
    bundle.on('error', function(err) {
      delete err.stream;
      log.error(options.logPrefix + ' @ ' + currentDateTime());
      log.warn(err.toString());
      if (!bundler.continueOnError && options.failOnError) {
        log.error(options.logPrefix + 'Ending browserify stream.');
        throw err;
      }
      return true;
    });

    if (options.isWatch) {
      bundle.on('end', function() {
        log.info(options.logPrefix + options.bundleFileName + ' has completed @ ' + currentDateTime());
      });
    }

    bundle = bundle.pipe(source(options.out))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}));

    if (!options.skipUglify) {
      bundle = bundle.pipe($.uglify());
    }

    return bundle.pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(options.dist));
  }

  bundleTask.taskName = options.taskName;

  return bundleTask;
}