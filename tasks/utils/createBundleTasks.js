const _ = require('lodash');

const cleanTasksGenerator = require('../clean');
const copyTasksGenerator = require('../copy-resources');
const stylesTasksGenerator = require('../build-styles');
const browserifyTasksGenerator = require('../build-app');
const jshintTasksGenerator = require('../jshint');

// Stores whether a task with a particular prefix was initialized before
const taskCache = {};

module.exports = function(gulp, options) {
  const taskPrefix = options.taskPrefix;

  if (!taskCache[taskPrefix]) {
    const tasks = {
      clean: cleanTasksGenerator(gulp, options),
      jshint: jshintTasksGenerator(gulp, options),
      styles: stylesTasksGenerator(gulp, options),
      copy: copyTasksGenerator(gulp, options),
      browserify: browserifyTasksGenerator(gulp, options)
    };

    const parallelBuildTasks = [];
    const parallelWatchTasks = [];

    if (tasks.jshint) {
      parallelBuildTasks.push(tasks.jshint.build);
      parallelWatchTasks.push(tasks.jshint.watch);
    }

    if (tasks.styles) {
      parallelBuildTasks.push(tasks.styles.build);
      parallelWatchTasks.push(tasks.styles.watch);
    }

    if (tasks.copy) {
      parallelBuildTasks.push(tasks.copy.build);
      parallelWatchTasks.push(tasks.copy.watch);
    }

    if (tasks.browserify) {
      parallelBuildTasks.push(tasks.browserify.build);
      parallelWatchTasks.push(tasks.browserify.watch);
    }

    const allBuildTasks = [];
    if (tasks.clean) {
      allBuildTasks.push(tasks.clean);
    }
    if (!_.isEmpty(parallelBuildTasks)) {
      allBuildTasks.push(gulp.parallel(parallelBuildTasks));
    }

    if (!_.isEmpty(allBuildTasks)) {
      tasks.build = gulp.series(allBuildTasks);
    }

    const allWatchTasks = [];
    if (tasks.clean) {
      allWatchTasks.push(tasks.clean);
    }
    if (!_.isEmpty(parallelWatchTasks)) {
      allWatchTasks.push(gulp.parallel(parallelWatchTasks));
    }

    if (!_.isEmpty(allWatchTasks)) {
      tasks.watch = gulp.series(allWatchTasks);
    }

    taskCache[taskPrefix] = tasks;
  }

  return taskCache[taskPrefix];
};