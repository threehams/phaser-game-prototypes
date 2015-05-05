'use strict';

var currentPlayer = require('./current-player');
var events = require('./events');

var Enemy = function(game, x, y, key, opts) {
  Phaser.Sprite.call(this, game, x, y, key);

  this.weaponOffsetX = opts.weaponOffsetX || 28;

  this.frames = opts.frames;
  this.weapon = opts.weapon;
  this.ai = opts.ai;

  this.velocity = opts.velocity;
  this.acceleration = opts.acceleration;
  this.maxVelocityX = opts.maxVelocityX;
  this.maxVelocityY = opts.maxVelocityY;
  this.drag = opts.drag;

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.maxVelocity.setTo(this.maxVelocityX, this.maxVelocityY);
  this.body.drag.setTo(this.drag, this.drag);
  this.body.setSize(opts.hitboxX * 2 || this.width * 0.8, opts.hitboxY * 2 || this.height * 0.8);
  this.scale.set(2, 2);
  this.exists = false;

  this.maxHealth = opts.maxHealth;
  this.pointsValue = opts.pointsValue;
  this.collideDamage = opts.collideDamage;

  this.frameName = this.frames.center;

  if (opts.target === 'player') this.target = currentPlayer.position;
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.parse = function(enemiesData, aiData, weaponsData) {
  var parsed = JSON.parse(enemiesData);
  _.forEach(parsed, function(enemy) {
    if (typeof enemy.ai === 'string') enemy.ai = aiData[enemy.ai];
    if (typeof enemy.weapon === 'string') enemy.weapon = weaponsData[enemy.weapon];
  });
  return Object.freeze(parsed);
};

Enemy.prototype.spawn = function(x) {
  this.reset(x, -80, this.maxHealth);

  this.body.velocity.y = this.velocity;
  this.body.acceleration.y = this.acceleration;

  var step = this.ai.steps[0];
  this.aiEvent = this.game.time.events.add(step.delay, this.updateAI, this);
};

// TODO remove after upgrading to Phaser 2.3.1
Enemy.prototype.damage = function(damage) {
  if (this.health <= 0) return;

  this.health -= damage;
  if (this.health <= 0) {
    this.kill();
    events.spawnExplosions.dispatch({x: this.position.x, y: this.position.y, width: this.width, height: this.height});
  }
};

Enemy.prototype.updateAI = function() {
  this[this.ai.currentStep().method]();
  var next = this.ai.updateStep();
  if (next) this.aiEvent = this.game.time.events.add(next.delay, this.updateAI, this);
};

Enemy.prototype.startFiring = function() {
  this.firing = true;
};

Enemy.prototype.stopFiring = function() {
  this.firing = false;
};

Enemy.prototype.turnLeft = function() {
  this.moveDirectionX = -1;
};

Enemy.prototype.turnRight = function() {
  this.moveDirectionX = 1;
};

Enemy.prototype.stopTurning = function() {
  this.moveDirectionX = 0;
};

Enemy.prototype.matchScroll = function() {
  this.moveDirectionY = -1;
};

Enemy.prototype.reset = function(x, y, health) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);

  this.ai.reset();
  this.firing = false;
  if (this.aiEvent) this.game.time.events.remove(this.aiEvent);
  this.moveDirectionX = 0;
  this.moveDirectionY = 0;
};

Enemy.prototype.update = function() {
  if (!this.alive) return;

  if (this.y > this.game.world.height + this.height / 2
    || this.x < -this.width / 2
    || this.x > this.game.world.width + this.width / 2) {
    return this.kill();
  }

  if (this.moveDirectionX) {
    this.body.acceleration.x = this.acceleration * this.moveDirectionX;
  } else {
    if (this.body.acceleration < 0) {
      this.body.acceleration.x = Math.min(this.body.acceleration.x + this.acceleration, 0);
    } else {
      this.body.acceleration.x = Math.max(this.body.acceleration.x - this.acceleration, 0);
    }
  }

  if (this.moveDirectionY === -1) {
    this.body.acceleration.y = 0;
  }
  // don't fire past a certain point on the screen, that's annoying
  if (this.firing && this.y < this.game.world.height - 200) this.weapon.fire(this, this.target, 90);

  if (this.frames.left) {
    if (this.body.velocity.x > this.maxVelocityX * 0.25) {
      this.frameName = this.frames.right;
    } else if (this.body.velocity.x < -this.maxVelocityX * 0.25) {
      this.frameName = this.frames.left;
    } else {
      this.frameName = this.frames.center;
    }
  }
};

module.exports = Enemy;