'use strict';

var MAX_VELOCITY_X = 400;
var MAX_VELOCITY_Y = 200;
var ACCELERATION = 400;
var DRAG = 400;

var Weapon = require('./weapon');

var Enemy = function(game, x, y, key, frame, bullets, player, audio) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.maxHealth = 100;

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.minFireRate = 500;
  this.maxFireRate = 1500;

  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(this.width * 0.8, this.height * 0.8);

  this.body.maxVelocity.setTo(MAX_VELOCITY_X, MAX_VELOCITY_Y);
  this.body.drag.setTo(DRAG, DRAG);

  this.scale.set(2, 2);
  this.frameName = 'enemies/jet1/0001';

  this.pointsValue = 100;
  this.collideDamage = 25;

  this.killDelay = 50;

  this.player = player;
  this.weapon = new Weapon(this.game, bullets, {minFireRate: 1000, maxFireRate: 2000, bulletSpeed: 150, bulletDamage: 10, audio: audio});

  this.exists = false;
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.spawn = function(x, direction) {
  this.reset(x, -40, this.maxHealth);

  this.body.velocity.y = 300;
  this.body.acceleration.y = 100;
  this.aiDirection = direction;

  this.fireEvent = this.game.time.events.add(_.random(this.minFireRate, this.maxFireRate), this.fire, this);
  this.ai = this.game.time.events.add(1000, this.turn, this);
};

// TODO remove after upgrading to Phaser 2.3.1
Enemy.prototype.damage = function(damage) {
  this.health -= damage;
  if (this.health <= 0) {
    this.kill();
  }
};

Enemy.prototype.fire = function() {
  this.firing = true;
};

Enemy.prototype.turn = function() {
  this.moveDirection = this.aiDirection;
};

Enemy.prototype.reset = function(x, y, health) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);

  if (this.ai) this.game.time.events.remove(this.ai);
  if (this.fireEvent) this.game.time.events.remove(this.fireEvent);
  this.moveDirection = 0;
};

Enemy.prototype.update = function() {
  if (!this.alive) return;

  if (this.y > this.game.world.height + this.height / 2
    || this.x < -this.width / 2
    || this.x > this.game.world.width + this.width / 2) {
    return this.kill();
  }

  if (this.moveDirection) {
    this.body.acceleration.x = ACCELERATION * this.moveDirection;
  }
  // don't fire if the player can't avoid it
  if (this.firing && this.y < this.game.world.height - 200) this.weapon.fire(this, this.player);

  if (this.body.velocity.x > MAX_VELOCITY_X * 0.25) {
    this.frameName = 'enemies/jet1/0002';
  } else if (this.body.velocity.x < -MAX_VELOCITY_X * 0.25) {
    this.frameName = 'enemies/jet1/0000';
  } else {
    this.frameName = 'enemies/jet1/0001';
  }
};

module.exports = Enemy;