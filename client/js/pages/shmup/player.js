'use strict';

var events = require('./events');

var Player = function(game, x, y, key, opts) {
  Phaser.Sprite.call(this, game, x, y, key);

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.frames = opts.frames;
  this.frameName = this.frames.center;

  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(this.width * 0.2, this.height * 0.2);

  this.weaponOffsetX = opts.weaponOffsetX;
  this.maxVelocity = opts.maxVelocity;
  this.body.maxVelocity.setTo(opts.maxVelocity, opts.maxVelocity);

  this.scale.set(2, 2);

  this.shields = opts.maxHealth;
  this.invincibilityDelay = opts.invincibilityDelay;
  this.weapons = [opts.weapon];

  this.invincibleUntil = 0;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.parse = function(playerData, weaponsData) {
  var player = JSON.parse(playerData);
  if (typeof player.weapon === 'string') player.weapon = weaponsData[player.weapon];
  return Object.freeze(player);
};

Player.prototype.stop = function() {
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
};

Player.prototype.moveLeft = function() {
  this.body.velocity.x = -this.maxVelocity;
};

Player.prototype.moveRight = function() {
  this.body.velocity.x = this.maxVelocity;
};

Player.prototype.moveUp = function() {
  this.body.velocity.y = -this.maxVelocity;
};

Player.prototype.moveDown = function() {
  this.body.velocity.y = this.maxVelocity;
};

Player.prototype.damageShields = function(damage) {
  if (this.game.time.time < this.invincibleUntil || this.shields === 0) return;
  this.shields --;
  if (this.shields <= 0) {
    this.shields = 0;
    this.explode();
  }
  this.invincibleUntil = this.game.time.time + this.invincibilityDelay;
};

Player.prototype.shieldsGone = function(damage) {
  return this.shields === 0;
};

Player.prototype.addWeapon = function(weapon) {
  // TODO use hardpoints, don't allow infinite numbers of weapons
  this.weapons.push(weapon);
};

Player.prototype.fireWeapon = function() {
  var that = this;
  _.forEach(this.weapons, function(weapon) {
    weapon.fire(that);
  });
};

Player.prototype.explode = function() {
  var that = this;
  this.game.time.events.repeat(250, 10, function() {
    events.spawnExplosions.dispatch({x: that.x, y: that.y, width: that.width, height: that.height});
  }, this);
  this.game.time.events.add(2500, function() {
    events.spawnExplosions.dispatch({x: that.x, y: that.y, width: that.width, height: that.height, burst: true});
    that.kill();
  });
  this.game.time.events.add(4000, function() {
    events.playerDead.dispatch();
  });
};

Player.prototype.update = function() {
  if (this.body.velocity.x < 0) {
    this.frameName = this.frames.left;
  } else if (this.body.velocity.x > this.maxVelocity * 0.5) {
    this.frameName = this.frames.right;
  } else {
    this.frameName = this.frames.center;
  }
};

module.exports = Player;