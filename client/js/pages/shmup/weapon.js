'use strict';

var events = require('./events');

var Weapon = function(game, bullets, weaponOpts) {
  Phaser.Group.call(this, game);

  // Make weapons an array if it isn't already one
  weaponOpts = [].concat(weaponOpts);

  this.parts = _.map(weaponOpts, function(opts) {
    return {
      minFireRate: opts.minFireRate,
      maxFireRate: opts.maxFireRate,
      fireRate: opts.fireRate,
      bulletDamage: opts.bulletDamage,
      bulletSpeed: opts.bulletSpeed,
      nextFire: 0,

      burstRate: opts.burstRate,
      burstCount: opts.burstCount,
      burstIndex: 0,

      randomOffset: opts.randomOffset,
      randomAngle: opts.randomAngle,

      bullets: bullets,

      audio: opts.audio,

      offsetPattern: opts.offsetPattern, // [0, 4, 8, 12, 8, 4, 0, -4, -8, -12, -8, -4]
      patternIndex: 0,

      bulletCount: opts.bulletCount || 1,
      spreadOffset: opts.spreadOffset || 0,
      spreadAngle: opts.spreadAngle || 0,

      frameName: opts.frameName
    }
  });
};

/*
 * Parse weapon JSON data and replace string with references.
 */
Weapon.parse = function(data) {
  var parsed = JSON.parse(data);
  // iterate through combination weapons and point them to the base weapon reference
  _.forEach(parsed, function(weaponList, weaponName) {
    if (Array.isArray(weaponList))
    parsed[weaponName] = _.map(weaponList, function(weaponString) {
      return parsed[weaponString];
    });
  });
  return Object.freeze(parsed);
};

Weapon.prototype = Object.create(Phaser.Group.prototype);
Weapon.prototype.constructor = Weapon;

Weapon.prototype.fire = function(source, target, angle) {
  var that = this;

  _.forEach(this.parts, function(part) {
    that.firePart(part, source, target, angle);
  });
};

Weapon.prototype.firePart = function(part, source, target, angle) {
  if (this.game.time.time < part.nextFire) return;

  // if target, aim at it! if not, just fire up
  angle = angle || 270;
  if (target) angle = this.game.physics.arcade.angleBetween(source, target) * (180 / Math.PI);

  var xOffset = 0;
  if (part.offsetPattern) {
    if (part.patternIndex === part.offsetPattern.length - 1) {
      part.patternIndex = 0;
    } else {
      part.patternIndex++;
    }
    xOffset = part.offsetPattern[part.patternIndex];
  }

  _.times(part.bulletCount, function(i) {
    var multiplier = 0;
    if (part.bulletCount % 2) { // if odd,
      // first shot is straight ahead
      if (i === 0) {
        // fire straight ahead
      } else if (i % 2) {
        multiplier = Math.floor((i + 1) / 2);
      } else {
        multiplier = -(Math.floor((i + 1) / 2));
      }
    } else {
      if (i % 2) {
        multiplier = Math.floor((i + 2) / 2);
      } else {
        multiplier = -(Math.floor((i + 2) / 2));
      }
    }

    var bulletAngle = (angle + part.spreadAngle * multiplier);
    var bulletXOffset = xOffset + (multiplier * part.spreadOffset);

    if (part.randomOffset) bulletXOffset += _.random(-part.randomOffset, part.randomOffset);
    if (part.randomAngle) bulletAngle += _.random(-part.randomAngle, part.randomAngle);

    var bullet = part.bullets.getFirstExists(false);
    bullet.frameName = part.frameName;
    bullet.fire(
      source.x + bulletXOffset,
      source.y + source.weaponOffsetX,
      bulletAngle,
      part.bulletSpeed,
      part.bulletDamage
    );
  });

  if (part.audio) events.playSound.dispatch(part.audio);

  var fireRate;
  if (part.burstCount) {
    part.burstIndex++;
    if (part.burstIndex < part.burstCount) {
      fireRate = part.burstRate;
    } else {
      part.burstIndex = 0;
      fireRate = part.fireRate ? part.fireRate : _.random(part.minFireRate, part.maxFireRate);
    }
  } else {
    fireRate = part.fireRate ? part.fireRate : _.random(part.minFireRate, part.maxFireRate);
  }

  part.nextFire = this.game.time.time + fireRate;
};

module.exports = Weapon;