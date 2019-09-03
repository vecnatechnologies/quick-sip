var buildTaskGenerator = require('./tasks/build');
var watchTaskGenerator = require('./tasks/watch');
var generateOptions = require('./tasks/utils/options');

module.exports = function(gulp, bundleOptions) {
  var defaultOptions = generateOptions();
  var options = defaultOptions.update(bundleOptions);
  buildTaskGenerator(gulp, options);
  return watchTaskGenerator(gulp, options);
};
