'use strict';

module.exports = ['$scope', '$interval', function ($scope, $interval) {
  $scope.startDate = moment('20150219', 'YYYYMMDD').toDate();

  $scope.calculateProgress = function(date) {
    // first do all full days
    var days = moment(date).diff($scope.startDate, 'days');

    // then subtract weekend days
    var day = moment(date).day();
    var weeks = Math.floor(days / 7);
    var daysLeft = days % 7;
    days -= weeks * 2;
    var startDay = moment($scope.startDate).day();

    if (daysLeft - day - startDay > 0) {
      days -= daysLeft - day - startDay;
    }

    var progress = days * 10;
    // then only look at hours
    var hours = moment(date).hours();
    if (hours > 10) {
      progress += Math.min(Math.floor((hours - 10) * 1.25), 10);
    }
    return progress;
  };

  $interval(function() {
    $scope.progress = $scope.calculateProgress(new Date());
  });
}];