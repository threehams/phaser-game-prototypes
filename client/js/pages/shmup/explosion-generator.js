'use strict';

var Explosion = require('./explosion');

var ExplosionGenerator = function(game, audio) {
  Phaser.Group.call(this, game);

  this.classType = Explosion;
  this.createMultiple(128, 'sprites');
  this.setAll('audio', audio, null, null, null, true);

  this.explosionSizes = ['tiny', 'small', 'normal'];
};

ExplosionGenerator.prototype = Object.create(Phaser.Group.prototype);
ExplosionGenerator.prototype.constructor = ExplosionGenerator;

ExplosionGenerator.prototype.spawn = function(source, burst) {
  var spread = 0;
  var yOffset = 0;
  function explode() {
    var explosion = this.getFirstExists(false);
    if (explosion) {
      explosion.spawn(
        source.x + _.random(-20, 20) * spread,
        (source.y + _.random(-20, 20) * spread) + yOffset,
        [0, 2],
        _.sample(this.explosionSizes)
      );
      if (!burst) {
        yOffset += 5;
        spread += 0.3;
      }
    } else {
      console.log('Ran out of explosions. :(')
    }
  }

  if (burst) {
    spread = 5;
    _.times(20, explode.bind(this));
  } else {
    explode.bind(this)();
    this.game.time.events.repeat(30, 5, explode, this);
  }
};

module.exports = ExplosionGenerator;