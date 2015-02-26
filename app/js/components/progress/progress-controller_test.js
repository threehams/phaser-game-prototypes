describe('ProgressController', function() {
  var that = this;

  beforeEach(angular.mock.module('SampleApp'));
  beforeEach(inject(function($rootScope, _$controller_) {
    that.scope = $rootScope;
    that.controller = _$controller_;
    that.controller('ProgressController', {'$scope': that.scope});
  }));

  it('returns 0 at start', function() {
    var date = moment('20150219', 'YYYYMMDD').toDate();
    expect(that.scope.calculateProgress(date)).to.eql(0);
  });

  it('returns 10 at start of next day', function() {
    var date = moment('20150220', 'YYYYMMDD').toDate();
    expect(that.scope.calculateProgress(date)).to.eql(10);
  });

  it('returns 5 at 2:00PM on the first day', function() {
    var date = moment('20150219 14:00:00', 'YYYYMMDD hh:mm:ss').toDate();
    expect(that.scope.calculateProgress(date)).to.eql(5);
  });

  it('stops progress on weekends', function() {
    var date = moment('20150222', 'YYYYMMDD').toDate();
    expect(that.scope.calculateProgress(date)).to.eql(20);
  });
});