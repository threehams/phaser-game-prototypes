module.exports = function() {
  return {
    restrict: 'E',
    scope: {
      auth: '='
    },
    template: require('./progress-template.jade'),
    controller: require('./progress-controller')
  }
};