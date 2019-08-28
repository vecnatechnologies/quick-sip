var cleanTaskGenerator = require('../clean');
var copyTaskGenerator = require('../copy-resources');
var stylesTaskGenerator = require('../build-styles');
var browserifyTaskGenerator = require('../build-app');
var jshintTaskGenerator = require('../jshint');

// Initialized stores whether a task with a particular prefix was initialized before
var taskCache = {};

module.exports = function(gulp, options) {
  var tasks = {};
  var taskPrefix = options.taskPrefix;

  if (!taskCache[taskPrefix]) {
    tasks.copy = copyTaskGenerator(gulp, options);
    tasks.styles = stylesTaskGenerator(gulp, options);
    tasks.browserify = browserifyTaskGenerator(gulp, options);
    tasks.clean = cleanTaskGenerator(gulp, options);
    tasks.jshint = jshintTaskGenerator(gulp, options);
    taskCache[taskPrefix] = tasks;
  }

  return taskCache[taskPrefix];
};