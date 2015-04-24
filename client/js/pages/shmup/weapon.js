'use strict';

var Weapon = function(game, bullets, opts) {
  Phaser.Group.call(this, game);

  this.minFireRate = opts.minFireRate;
  this.maxFireRate = opts.maxFireRate;
  this.fireRate = opts.fireRate;
  this.bulletDamage = opts.bulletDamage;

  this.bulletSpeed = opts.bulletSpeed;
  this.nextFire = 0;

  this.bullets = bullets;

  this.pattern = opts.pattern; // [0, 4, 8, 12, 8, 4, 0, -4, -8, -12, -8, -4];
  this.patternIndex = 0;
};

Weapon.prototype = Object.create(Phaser.Group.prototype);
Weapon.prototype.constructor = Weapon;

Weapon.prototype.fire = function(source, target) {
  if (this.game.time.time < this.nextFire) return;

  // if target, aim at it! if not, just fire up
  var angle = 270;
  if (target) angle = this.game.physics.arcade.angleBetween(source, target) * (180 / Math.PI);

  var xOffset = 0;
  if (this.pattern) {
    if (this.patternIndex === this.pattern.length - 1) {
      this.patternIndex = 0;
    } else {
      this.patternIndex++;
    }
    xOffset = this.pattern[this.patternIndex];
  }

  var bullet = this.bullets.getFirstExists(false);
  bullet.fire(
    source.x + xOffset,
    source.y - 32,
    angle,
    this.bulletSpeed,
    this.bulletDamage
  );
  var fireRate = this.fireRate ? this.fireRate : _.random(this.minFireRate, this.maxFireRate);
  this.nextFire = this.game.time.time + fireRate;
};

module.exports = Weapon;