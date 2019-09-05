const _ = require('lodash');
const minimist = require('minimist');

const PRODUCTION_BUILD_TYPE = 'production';

const argv = minimist(process.argv.slice(2));
const buildType = argv.type;
const IS_PRODUCTION_BUILD = buildType === PRODUCTION_BUILD_TYPE;

// Function creates a new options object each time
// This options object should be generated once for each execution of quick-sip
// and passed into all task registrations that require this object
module.exports = function() {
  const baseDefaults = {
    taskPrefix: '',
    src: 'app',
    dist: 'dist',
    clean: {},
    browserify: {},
    styles: {},
    copy: {}
  };

  // Generate bundle defaults from an options parameter
  function generateBundleDefaults(opts) {
    return {
      clean: {
        skip: false,
        dist: opts.dist
      },
      browserify: {
        skip: false,
        root: './' + opts.src + '/app',
        transforms: [],
        out: 'app.js',
        failOnError: false,
        debug: !IS_PRODUCTION_BUILD,
        dist: opts.dist
      },
      styles: {
        skip: false,
        root: opts.src + '/app.scss',
        src: opts.src,
        includes: [],
        dist: opts.dist
      },
      jshint: {
        src: './' + opts.src,
        globRelativeToSrc: '**/*.js',
        skip: false,
        stopOnFail: true,
        config: {}
      },
      copy: {
        skip: false,
        src: opts.src,
        excludes: 'scss',
        dist: opts.dist,

        /**
         * Constructs the [source, exclusion] pair used when copying resources.
         * Takes in an optional source location, defaults to the copy.src setting if not provided.
         */
        _buildSrcExclusionPair: function(optionalSrc) {
          const sourceLoc = optionalSrc || this.src;
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
          const copyOptions = this;
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
  }

  const options = _.merge({}, baseDefaults, generateBundleDefaults(baseDefaults));

  // Update options
  // For certain options, if a key isn't defined at the task level, it will default to the value specified at the top level
  options.update = function(newOptions) {
    const bundleDefaults = generateBundleDefaults(_.merge({}, baseDefaults, newOptions));

    return _.merge(options, bundleDefaults, newOptions);
  };

  return options;
};
