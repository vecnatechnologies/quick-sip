const del = require('del');
const log = require('color-log');

module.exports = function(gulp, options) {
  if (options.clean.skip) {
    return;
  }

  /* Clean the options.clean.dist directory */
  const taskName = options.taskPrefix + 'clean';
  const logPrefix = '[' + taskName + '] ';

  function clean(callback) {
    log.info(logPrefix + 'deleting ' + options.clean.dist);
    del(options.clean.dist, options.clean)
      .then(function() {
        callback();
      }, function(error) {
        log.error(logPrefix + 'clean task errored');
        log.error(error);
        callback();
      });
  }

  return clean;
};
