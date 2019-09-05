/* Current date-time printer */
module.exports = function() {
  const date = new Date();
  let datetime = '';
  datetime += date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ';
  datetime += (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
  return datetime;
};