'use strict';

var Player = require('./player');
var Bullet = require('./bullet');
var EnemyGenerator = require('./enemy-generator');
var ExplosionGenerator = require('./explosion-generator');
var Weapon = require('./weapon');
var Enemy = require('./enemy');
var AI = require('./ai');
var currentPlayer = require('./current-player');

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.image('background', 'img/shmup-background.png');
    this.load.image('pressStart', 'img/press-start.png');
    this.load.atlasJSONHash('sprites', 'img/shmup-sprites.png', 'assets/shmup-sprites.json');
    this.game.load.audio('music', 'assets/tyrian-the-level.mp3');
    this.game.load.audio('explosionTiny', 'assets/explosion-tiny.mp3');
    this.game.load.audio('explosionSmall', 'assets/explosion-small.mp3');
    this.game.load.audio('explosionNormal', 'assets/explosion-normal.mp3');
    this.game.load.audio('explosionLarge', 'assets/explosion-large.mp3');
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

    this.padding = 36;

    this.music = this.game.add.audio('music');
    this.game.add.audio('firePulse');
    this.game.add.audio('fireSmall');
    this.audio = {
      explosions: {
        tiny: this.game.add.audio('explosionTiny'),
        small: this.game.add.audio('explosionSmall'),
        normal: this.game.add.audio('explosionLarge')
      }
    };

    //this.game.sound.mute = true;

    this.background = this.game.add.tileSprite(0, 0, 400, 600, 'background');
    this.background.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.background.autoScroll(0, 30);
    this.background.scale.set(2, 2);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.playerBullets = new Phaser.Group(this.game, null);
    this.enemyBullets = new Phaser.Group(this.game, null);

    _.times(128, function() {
      that.playerBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/pulse1'), true);
    });
    _.times(512).map(function() {
      that.enemyBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/enemy/0000'), true);
    });

    this.player = new Player(this.game, 200, this.world.height - this.padding, 'sprites', null);
    this.game.add.existing(this.player);
    currentPlayer.position = this.player.position;

    var weapon = new Weapon(this.game, this.playerBullets, this.weaponsData.multi);
    this.game.add.existing(weapon);
    this.player.addWeapon(weapon);

    this.totalEnemyGroupWeight = 0;
    this.enemyGroups = _.map(this.enemyGroupsData, function(group) {
      that.totalEnemyGroupWeight += group.weight;
      return new EnemyGenerator(that.game, group, that.enemyBullets);
    });

    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.shieldsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.game.add.image(20, 20, this.shieldsText);
    this.updateShields(this.player.shields);

    this.points = 0;
    this.pointsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.game.add.image(260, 20, this.pointsText);
    this.updatePoints();

    this.explosions = new ExplosionGenerator(this.game, this.audio.explosions);

    this.game.sound.setDecodedCallback([this.music], this.playMusic, this);

    this.game.add.existing(this.playerBullets);
    this.game.add.existing(this.enemyBullets);

    this.game.time.events.loop(2000, this.spawnGroup, this);
  },

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
    this.music.play(null, null, 0.5);
  },

  update: function() {
    if (this.won || this.lost) return;
    var that = this;

    this.player.stop();

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
    // move player if key pressed
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    }
    if (this.cursors.up.isDown) {
      this.player.moveUp();
    } else if (this.cursors.down.isDown) {
      this.player.moveDown();
    }

    // fire player weapon if key pressed
    if (this.fireButton.isDown) {
      this.player.fireWeapon();
    }

    // cover overlap of player, enemies, bullets
    this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerHit, null, this);

    _.forEach(this.enemyGroups, function(group) {
      that.game.physics.arcade.overlap(that.player, group, that.enemyCollide, null, that);
      that.game.physics.arcade.overlap(that.playerBullets, group, that.enemyHit, null, that);
    })
  },

  enemyCollide: function(player, enemy) {
    enemy.kill();
    //this.explosions.spawn(enemy);
    player.damageShields(enemy.collideDamage);
    this.updateShields(player.shields);

    if (player.shieldsGone()) {
      this.showLose();
    }
  },

  enemyHit: function(bullet, enemy) {
    enemy.damage(bullet.damageDealt);
    bullet.kill();

    if (!enemy.alive) {
      //this.explosions.spawn(enemy);
      this.points += enemy.pointsValue;
      this.updatePoints();
    }
  },

  spawnExplosion: function(source, number) {
    this.explosions.spawn(enemy, number);
  },

  playerHit: function(player, bullet) {
    bullet.kill();
    if (player.shieldsGone()) return;

    player.damageShields(bullet.damageDealt);

    this.updateShields(player.shields);
    if (player.shieldsGone()) {
      this.showLose();
    }
  },

  updatePoints: function() {
    this.pointsText.text = _.padLeft(this.points, 6, '0');
  },

  updateShields: function(shields) {
    this.shieldsText.text = _.padLeft(shields, 3, '0');
  },

  showLose: function() {
    this.game.time.events.repeat(250, 10, function() {
      this.explosions.spawn(this.player);
    }, this);

    this.game.time.events.add(2500, function() {
      this.lost = true;
      this.explosions.spawn(this.player, {burst: true});
      this.player.kill();

      this.game.time.events.add(1500, function() {

        this.game.paused = true;

        var graphics = this.game.add.graphics(80, 280);
        graphics.beginFill('#000000');
        graphics.drawRect(0, 0, 240, 60);
        graphics.endFill();

        var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
        font.text = 'YOUR LOSER';
        this.game.add.image(100, 300, font);

        this.game.paused = true;
      }, this)
    }, this);
  },

  showWin: function() {
    this.won = true;

    var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    font.text = 'YOU\'RE WIN';
    this.game.add.image(100, 300, font);
  }
};

module.exports = Game;