'use strict';

var AI = require('./ai');
var AudioComponent = require('./components/audio-component');
var Bullet = require('./bullet');
var Enemy = require('./enemy');
var EnemyGenerator = require('./enemy-generator');
var ExplosionGenerator = require('./explosion-generator');
var PlayerController = require('./player-controller');
var Player = require('./player');
var UI = require('./ui');
var Weapon = require('./weapon');

var currentPlayer = require('./current-player');
var events = require('./events');

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.image('background', 'img/shmup-background.png');
    this.load.image('pressStart', 'img/press-start.png');
    this.load.atlasJSONHash('sprites', 'img/shmup-sprites.png', 'assets/shmup-sprites.json');
    this.game.load.audio('music', 'assets/tyrian-the-level.mp3');
    this.game.load.audio('explosionTiny', 'assets/explosion-tiny.mp3');
    this.game.load.audio('explosionSmall', 'assets/explosion-small.mp3');
    this.game.load.audio('explosionMediumish', 'assets/explosion-normal.mp3');
    this.game.load.audio('explosionNormal', 'assets/explosion-large.mp3');
    this.game.load.audio('firePulse', 'assets/fire-pulse.mp3');
    this.game.load.audio('fireSmall', 'assets/fire-small.mp3');
    this.game.load.audio('fireVulcan', 'assets/fire-vulcan.mp3');
    this.game.load.text('weaponsData', 'assets/weapons.json');
    this.game.load.text('enemiesData', 'assets/enemies.json');
    this.game.load.text('aiData', 'assets/ai.json');
    this.game.load.text('enemyGroupsData', 'assets/enemy-groups.json');
  },

  create: function () {
    var that = this;

    this.weaponsData = Weapon.parse(this.cache.getText('weaponsData'));
    this.aiData = AI.parse(this.cache.getText('aiData'));
    this.enemiesData = Enemy.parse(this.cache.getText('enemiesData'), this.aiData, this.weaponsData);
    this.enemyGroupsData = EnemyGenerator.parse(this.cache.getText('enemyGroupsData'), this.enemiesData);

    this.padding = 36; // boundaries for the player in the world

    // Audio service prevents sounds from triggering too often
    this.audioService = new AudioComponent(this.game);

    // Move this into audio service? Could go either place
    this.game.add.audio('music');
    this.game.add.audio('firePulse');
    this.game.add.audio('fireSmall');
    this.game.add.audio('fireVulcan');
    this.game.add.audio('explosionTiny');
    this.game.add.audio('explosionSmall');
    this.game.add.audio('explosionNormal');

    this.background = this.game.add.tileSprite(0, 0, 400, 600, 'background');
    this.background.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.background.autoScroll(0, 30);
    this.background.scale.set(2, 2);

    // TODO maybe belongs in a class which controls this object pool? also, maybe merge these, but would make collision checking annoying
    this.playerBullets = new Phaser.Group(this.game, null);
    this.enemyBullets = new Phaser.Group(this.game, null);

    _.times(128, function() {
      that.playerBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/pulse1'), true);
    });
    _.times(512).map(function() {
      that.enemyBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/enemy/0000'), true);
    });

    // TODO Have the player get its weapon from JSON data
    this.player = new Player(this.game, 200, this.world.height - this.padding, 'sprites', null);
    this.game.add.existing(this.player);
    currentPlayer.position = this.player.position;

    var weapon = new Weapon(this.game, this.playerBullets, this.weaponsData.multi);
    this.game.add.existing(weapon);
    this.player.addWeapon(weapon);

    // TODO Director class to control overall enemy grouping?
    this.totalEnemyGroupWeight = 0;
    this.enemyGroups = _.map(this.enemyGroupsData, function(group) {
      that.totalEnemyGroupWeight += group.weight;
      return new EnemyGenerator(that.game, group, that.enemyBullets);
    });

    this.playerController = new PlayerController(this.game, this.player);

    this.points = 0;

    this.explosions = new ExplosionGenerator(this.game);
    this.game.sound.setDecodedCallback([this.music], this.playMusic, this);

    // These have to be added last so they appear on top of everything
    this.game.add.existing(this.playerBullets);
    this.game.add.existing(this.enemyBullets);

    this.ui = new UI(this.game); // UI goes on top of everything

    this.game.time.events.loop(2000, this.spawnGroup, this);
    events.playerDead.add(this.showLose, this);
  },

  // TODO move to Director class?
  spawnGroup: function() {
    // anything more efficient would be overkill for such a small array
    var weight = _.random(0, this.totalEnemyGroupWeight);
    _.forEach(this.enemyGroups, function(group) {
      if (weight < group.weight) {
        group.spawn();
        return false;
      } else {
        weight -= group.weight;
      }
    });
  },

  playMusic: function() {
    events.playSound.dispatch('music', 0.5);
  },

  update: function() {
    if (this.won || this.lost) return;
    var that = this;

    // force player back in bounds
    if (this.player.x < this.padding) {
      this.player.x = this.padding;
    } else if (this.player.x > this.world.width - this.padding) {
      this.player.x = this.world.width - this.padding;
    }
    if (this.player.y > this.world.height - this.padding) {
      this.player.y = this.world.height - this.padding;
    } else if (this.player.y < this.padding) {
      this.player.y = this.padding;
    }

    this.playerController.update();

    // cover overlap of player, enemies, bullets
    this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerHit, null, this);

    _.forEach(this.enemyGroups, function(group) {
      that.game.physics.arcade.overlap(that.player, group, that.enemyCollide, null, that);
      that.game.physics.arcade.overlap(that.playerBullets, group, that.enemyHit, null, that);
    });
    this.audioService.update();
    this.ui.update({points: this.points, shields: this.player.shields});
  },

  enemyCollide: function(player, enemy) {
    enemy.damage(enemy.maxHealth);
    enemy.kill();
    player.damageShields(enemy.collideDamage);
  },

  enemyHit: function(bullet, enemy) {
    enemy.damage(bullet.damageDealt);
    bullet.kill();

    if (!enemy.alive) {
      this.points += enemy.pointsValue;
    }
  },

  playerHit: function(player, bullet) {
    bullet.kill();
    if (player.shieldsGone()) return;

    player.damageShields(bullet.damageDealt);
  },

  showLose: function() {
    var that = this;

    this.lost = true;
    this.game.paused = true;

    that.ui.showLose();
  }

  // TODO implement winning
  //showWin: function() {
  //  this.won = true;
  //
  //  var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
  //  font.text = 'YOU\'RE WIN';
  //  this.game.add.image(100, 300, font);
  //}
};

module.exports = Game;