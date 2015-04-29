'use strict';

var MAX_VELOCITY = 350;
var ACCELERATION = 4000;
var DRAG = 3000;

var Player = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.isPlayer = true; // for determining collision effects

  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(this.width * 0.2, this.height * 0.2);
  this.weaponOffsetX = -32;

  this.body.maxVelocity.setTo(MAX_VELOCITY, MAX_VELOCITY);
  this.body.drag.setTo(DRAG, DRAG);

  this.scale.set(2, 2);

  this.frameName = 'playerships/phoenix/0002';

  this.shields = 3;
  this.weapons = [];

  this.invincibleUntil = 0;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.stop = function() {
  this.body.velocity.x = 0;
  this.body.velocity.y = 0;
};

Player.prototype.moveLeft = function() {
  this.body.velocity.x = -MAX_VELOCITY;
};

Player.prototype.moveRight = function() {
  this.body.velocity.x = MAX_VELOCITY;
};

Player.prototype.moveUp = function() {
  this.body.velocity.y = -MAX_VELOCITY;
};

Player.prototype.moveDown = function() {
  this.body.velocity.y = MAX_VELOCITY;
};

Player.prototype.damageShields = function(damage) {
  if (this.game.time.time < this.invincibleUntil || this.shields === 0) return;
  this.shields --;
  if (this.shields <= 0) {
    this.shields = 0;
  }
  this.invincibleUntil = this.game.time.time + 3000;
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

Player.prototype.update = function() {
  if (this.body.velocity.x > MAX_VELOCITY * 0.75) {
    this.frameName = 'playerships/phoenix/0004';
  } else if (this.body.velocity.x > MAX_VELOCITY * 0.5) {
    this.frameName = 'playerships/phoenix/0003';
  } else if (this.body.velocity.x < -MAX_VELOCITY * 0.75) {
    this.frameName = 'playerships/phoenix/0000';
  } else if (this.body.velocity.x < -MAX_VELOCITY * 0.5) {
    this.frameName = 'playerships/phoenix/0001';
  } else {
    this.frameName = 'playerships/phoenix/0002';
  }
};

module.exports = Player;