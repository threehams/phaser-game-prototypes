function AI(opts) {
  this.steps = opts.steps;
  this.step = 0;
}

AI.parse = function(data) {
  return JSON.parse(data);
};

AI.prototype.currentStep = function() {
  return this.steps[this.step];
};

AI.prototype.updateStep = function() {
  this.step++;
  return this.steps[this.step];
};

AI.prototype.reset = function() {
  this.step = 0;
};

module.exports = AI;