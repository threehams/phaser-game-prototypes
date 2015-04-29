'use strict';

var Enemy = require('./enemy');
var Weapon = require('./weapon');
var AI = require('./ai');

var EnemyGenerator = function(game, opts, bullets) {
  Phaser.Group.call(this, game);

  var that = this;

  if (opts.position === 'center') this.spawnPosition = this.game.world.centerX;
  if (opts.positionOffset) this.spawnPosition += opts.positionOffset;

  this.randomOffset = opts.randomOffset || 0;
  this.spawnCount = opts.spawnCount;
  this.spawnDelay = opts.spawnDelay;
  this.spawnOffset = opts.spawnOffset || 0;

  _.times(12, function() {
    var weapon = new Weapon(that.game, bullets, opts.enemy.weapon);
    var ai = new AI(opts.enemy.ai);
    that.add(new Enemy(that.game, 0, 0, 'sprites', _.merge({ai: ai, weapon: weapon}, _.omit(opts.enemy, 'weapon', 'ai'))));
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
    position += this.spawnOffset;
  }, this);
};

module.exports = EnemyGenerator;