const log = require('color-log');
const _ = require('lodash');

/**
 * Adds error and end listeners to the passed in watcher.
 * @param watcher {gulp.watcher} watcher is created using gulp.watch(...);
 *   @param watcher.on {function} the method used to add event listeners to the watcher.
 * @param logPrefix {string} the prefix to use for log messages (usually includes the task name).
 * @return {gulp.watcher} the passed in gulp watcher for chaining.
 */
module.exports = function(watcher, logPrefix) {
  if (!watcher) {
    const noWatcherErrorMessage = 'Watcher not defined.  Cannot wrap the watcher with error listeners!';
    log.error(noWatcherErrorMessage);
    throw noWatcherErrorMessage;
  }
  if (!_.isFunction(watcher.on)) {
    const notAnEmitterErrorMessage = 'The watcher is not an event emitter.  Cannot wrap the watcher with error listeners!';
    log.error(notAnEmitterErrorMessage);
    throw notAnEmitterErrorMessage;
  }
  watcher.on('error', function(error) {
    log.error(logPrefix + '- Watch errored! ' + error);
  });
  watcher.on('end', function() {
    log.info(logPrefix + '- Watch ended!');
  });
  return watcher;
};