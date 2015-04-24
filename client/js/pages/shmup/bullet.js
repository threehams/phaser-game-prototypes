'use strict';

var Bullet = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);

  this.scale.set(2, 2);
  this.anchor.setTo(0.5, 0.5);

  this.exists = false;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.OWNERS = {
  PLAYER: 0,
  ENEMY: 1
};

Bullet.prototype.reset = function(x, y, health) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);

  this.moveDirection = 0;
};

Bullet.prototype.fire = function(x, y, angle, speed, damage) {
  this.damageDealt = damage;
  this.reset(x, y);
  this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
};

Bullet.prototype.update = function() {
  if (this.y < 0 || this.x < -this.width || this.x > this.game.world.height + this.width) {
    this.kill();
  }
};

module.exports = Bullet;