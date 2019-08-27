var del = require('del'),
    log = require('color-log');

module.exports = function(gulp, options) {

  if (!options.clean.skip) {
    /* Clean the options.clean.dist directory */
    var taskName = options.taskPrefix + 'clean';
    gulp.task(taskName, function(callback) {
      log.mark('[' + taskName + '] deleting ' + options.clean.dist);
      del(options.clean.dist, options.clean).then(function() {
        callback();
      });
    });
  }
};
