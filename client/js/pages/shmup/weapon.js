'use strict';

var AudioComponent = require('./components/audio-component');

var Weapon = function(game, bullets, weaponOpts) {
  Phaser.Group.call(this, game);

  this.audioComponent = new AudioComponent(game);

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

      bullets: bullets,

      audio: opts.audio,

      pattern: opts.pattern, // [0, 4, 8, 12, 8, 4, 0, -4, -8, -12, -8, -4]
      patternIndex: 0,

      bulletCount: opts.bulletCount || 1,
      spreadOffset: opts.spreadOffset || 0,
      spreadAngle: opts.spreadAngle || 0
    }
  });
};

/*
 * Parse weapon JSON data and replace string with references.
 */
Weapon.parse = function(data) {
  var parsed = JSON.parse(data);
  // iterate through combination weapons and point them to the base weapon reference
  _.forEach(parsed.combination, function(weaponList, weaponName) {
    parsed.combination[weaponName] = _.map(weaponList, function(weaponString) {
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
  if (part.pattern) {
    if (part.patternIndex === part.pattern.length - 1) {
      part.patternIndex = 0;
    } else {
      part.patternIndex++;
    }
    xOffset = part.pattern[part.patternIndex];
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

    var bulletAngle = angle + part.spreadAngle * multiplier;
    var bulletXOffset = xOffset + (multiplier * part.spreadOffset);

    var bullet = part.bullets.getFirstExists(false);
    bullet.fire(
      source.x + bulletXOffset,
      source.y + source.weaponOffsetX,
      bulletAngle,
      part.bulletSpeed,
      part.bulletDamage
    );
  });

  if (part.audio) this.audioComponent.play(part.audio);

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