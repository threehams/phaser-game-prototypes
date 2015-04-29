'use strict';

var Enemy = require('./enemy');
var Weapon = require('./weapon');
var AI = require('./ai');

var EnemyGenerator = function(game, spawnOpts, bullets) {
  Phaser.Group.call(this, game);

  var that = this;

  if (spawnOpts.position === 'center') this.spawnPosition = this.game.world.centerX;
  this.randomOffset = spawnOpts.randomOffset;
  this.spawnCount = spawnOpts.spawnCount;
  this.spawnDelay = spawnOpts.spawnDelay;

  _.times(12, function() {
    var weapon = new Weapon(that.game, bullets, spawnOpts.enemy.weapon);
    var ai = new AI(spawnOpts.enemy.ai);
    that.add(new Enemy(that.game, 0, 0, 'sprites', _.merge({ai: ai, weapon: weapon}, _.omit(spawnOpts.enemy, 'weapon', 'ai'))));
  });
};

EnemyGenerator.prototype = Object.create(Phaser.Group.prototype);
EnemyGenerator.prototype.constructor = EnemyGenerator;

EnemyGenerator.parse = function(enemyGroupsData, enemiesData) {
  var parsed = JSON.parse(enemyGroupsData);
  _.forEach(parsed, function(group) {
    if (typeof group.enemy === 'string') group.enemy = enemiesData[group.enemy];
  });
  return Object.freeze(parsed);
};

EnemyGenerator.prototype.spawn = function() {
  var position = _.random(this.spawnPosition - this.randomOffset, this.spawnPosition + this.randomOffset);
  this.game.time.events.repeat(this.spawnDelay, this.spawnCount, function() {
    this.getFirstExists(false).spawn(position);
  }, this);

  //var i = -2;
  //var center = this.game.world.centerX;
  //var position;
  //this.game.time.events.repeat(100, 6, function() {
  //  position = center + (i * 50);
  //  i++;
  //  console.log(position);
  //  this.getFirstExists(false).spawn(position);
  //}, this);
};

module.exports = EnemyGenerator;