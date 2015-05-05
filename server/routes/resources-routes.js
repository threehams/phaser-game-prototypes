'use strict';
var fs = require('fs');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

module.exports = function(router) {
  router.get('/memory', function *() {
    this.body = yield fs.readFileAsync('./dist/index.html');
  });
};