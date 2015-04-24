'use strict';

var Enemy = require('./enemy');

var EnemyGenerator = function(game, bullets, player) {
  Phaser.Group.call(this, game);

  var that = this;

  this.spawnRateMin = 2000;
  this.spawnRateMax = 6000;

  this.nextSpawn = this.game.time.time + 1000;
  _.times(12, function() {
    that.add(new Enemy(that.game, 0, 0, 'sprites', 'enemies/jet1/0000', bullets, player));
  });
};

EnemyGenerator.prototype = Object.create(Phaser.Group.prototype);
EnemyGenerator.prototype.constructor = EnemyGenerator;

EnemyGenerator.prototype.spawn = function() {
  if (this.game.time.time < this.nextSpawn) return;

  var direction = _.random(-1, 1);
  var center = this.game.world.centerX;
  var position = _.random(center - 200, center + 200);
  this.game.time.events.repeat(300, 4, function() {
    this.getFirstExists(false).spawn(position, direction);
  }, this);

  this.nextSpawn = this.game.time.time + _.random(this.spawnRateMin, this.spawnRateMax);
};

module.exports = EnemyGenerator;