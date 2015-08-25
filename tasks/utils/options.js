var _ = require('lodash')
    $ = require('gulp-load-plugins')({});

var options = {};

module.exports = options;

module.exports.updateOptions = function(newOptions) {
  var bundleDefaults,
      baseBundleDefaults = {
        taskPrefix: '',
        src: 'app',
        dist: 'dist',
        clean: {}, // see defaults in ./tasks/clean.js - only included here for the skips below.
        browserify: {}, // see defaults in ./tasks/build-app.js - only included here for the skips below.
        styles: {}, // see defaults in ./tasks/build-styles.js - only included here for the skips below.
        copy: {} // see defaults in ./tasks/copy-resources.js - only included here for the skips below.
      };

  // Properties used in the defaults below.  2nd merge is to perserve the options object reference.
  _.merge(options, _.merge(baseBundleDefaults, options, newOptions));

  bundleDefaults = {
    clean: {
      skip: false,
      dist: options.dist
    },
    browserify: {
      skip: false,
      root: './' + options.src + '/app',
      transforms: [],
      out: 'app.js',
      failOnError: false,
      debug: $.util.env.type !== 'production',
      dist: options.dist
    },
    styles: {
      skip: false,
      includes: [],
      root: options.src + '/app.scss',
      dist: options.dist
    },
    copy: {
      skip: false,
      src: options.src,
      excludes: 'scss',
      dist: options.dist,

      /**
       * Constructs the [source, exclusion] pair used when copying resources.
       * Takes in an optional source location, defaults to the copy.src setting if not provided.
       */
      _buildSrcExclusionPair: function(optionalSrc) {
        var sourceLoc = optionalSrc || this.src;
        return [
            sourceLoc + '/**/*.*',
            '!' + sourceLoc + '/**/*.+(' + this.excludes + ')'
        ]
      },

      /**
       * Builds a flat map of all the [source, exclusion] pairs.
       * Each item in the copy.src array will construct a new pair. If copy.src is just a single item, return the single pair.
       */
      buildFullSrcArray: function() {
        var copyOptions = this;
        if (Array.isArray(this.src)) {
          return this.src.map(function(entry) {
            return copyOptions._buildSrcExclusionPair(entry);
          }).reduce(function(copy, exclude) {
            return copy.concat(exclude);
          });
        } else {
          return this._buildSrcExclusionPair();
        }
      }
    }
  };

  // 2nd merge is to perserve the options object reference.
  _.merge(options, _.merge(bundleDefaults, options));

  return options;
};
