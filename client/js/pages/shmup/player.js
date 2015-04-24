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
  this.body.setSize(this.width * 0.8, this.height * 0.8);

  this.body.maxVelocity.setTo(MAX_VELOCITY, MAX_VELOCITY);
  this.body.drag.setTo(DRAG, DRAG);

  this.scale.set(2, 2);

  this.frameName = 'playerships/phoenix/0002';

  this.shields = 100;
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.stop = function() {
  this.body.acceleration.x = 0;
};

Player.prototype.moveLeft = function() {
  this.body.acceleration.x = -ACCELERATION;
};

Player.prototype.moveRight = function() {
  this.body.acceleration.x = ACCELERATION;
};

Player.prototype.damageShields = function(damage) {
  this.shields -= damage;
  if (this.shields < 0) this.shields = 0;
};

Player.prototype.shieldsGone = function(damage) {
  return this.shields === 0;
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