'use strict';

var Explosion = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.scale.set(2, 2);
  this.anchor.setTo(0.5, 0.5);

  function getFrames(size, count) {
    return _.range(0, count).map(function(i) {
      return 'explosions/' + size + '/' + _.padLeft(i.toString(), 4, '0');
    });
  }

  this.animations.add('tiny', getFrames('tiny', 5), 30, false);
  this.animations.add('small', getFrames('small', 12), 30, false);
  this.animations.add('normal', getFrames('normal', 14), 30, false);
};

Explosion.prototype = Object.create(Phaser.Sprite.prototype);
Explosion.prototype.constructor = Explosion;

Explosion.prototype.spawn = function(x, y, vector, size) {
  this.reset(x, y);
  this.xSpeed = vector[0];
  this.ySpeed = vector[1];

  this.play(size, null, false, true);
  this.audio[size].play();
};

Explosion.prototype.update = function() {
  if (!this.alive) return;
  if (this.y < 0) {
    this.kill();
  }
  if (this.xSpeed) {
    this.x += this.xSpeed;
  }
  if (this.ySpeed) {
    this.y += this.ySpeed;
  }
};

module.exports = Explosion;