'use strict';

var Explosion = require('./explosion');
var events = require('./events');

var ExplosionGenerator = function(game) {
  Phaser.Group.call(this, game);

  this.classType = Explosion;
  this.createMultiple(256, 'sprites');

  this.explosionSizes = ['tiny', 'small', 'normal'];
  events.spawnExplosions.add(this.spawn, this);
};

ExplosionGenerator.prototype = Object.create(Phaser.Group.prototype);
ExplosionGenerator.prototype.constructor = ExplosionGenerator;

/*
 * @param opts.x        X position (centered)
 * @param opts.y        Y position (centered)
 * @param opts.width    Width of exploding sprite
 * @param opts.height   Height of exploding sprite
 * @param opts.burst    True if explosions happen all at once, false if they're spaced out evenly
 */
ExplosionGenerator.prototype.spawn = function(opts) {
  var that = this;

  var spread = 0.5;
  var yOffset = 0;
  var totalCount = opts.width * opts.height / 400;
  var perStep = 4;
  var steps = Math.floor(totalCount / perStep);

  function explode() {
    _.times(perStep, function() {
      var explosion = that.getFirstExists(false);
      if (explosion) {
        explosion.spawn(
          opts.x + _.random(-opts.width / 2, opts.width / 2) * spread,
          (opts.y + _.random(-opts.height / 2, opts.height / 2) * spread) + yOffset,
          [0, 2],
          _.sample(that.explosionSizes)
        );
      } else {
        console.log('Ran out of explosions. :(')
      }
    });
    if (!opts.burst) {
      //yOffset += 2.5;
      spread += 0.01;
    }
  }

  if (opts.burst) {
    spread = 5;
    _.times(totalCount, explode.bind(this));
  } else {
    explode.bind(this)();
    this.game.time.events.repeat(30, steps, explode, this);
  }
};

module.exports = ExplosionGenerator;