const createBundleTasks = require('./tasks/utils/createBundleTasks');
const generateOptions = require('./tasks/utils/options');

module.exports = function(gulp, bundleOptions) {
  const defaultOptions = generateOptions();
  const options = defaultOptions.update(bundleOptions);
  return createBundleTasks(gulp, options);
};
