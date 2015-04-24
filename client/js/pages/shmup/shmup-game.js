'use strict';

var Player = require('./player');
var Weapon = require('./weapon');
var Bullet = require('./bullet');
var EnemyGenerator = require('./enemy-generator');
var ExplosionGenerator = require('./explosion-generator');

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.image('background', 'img/shmup-background.png');
    this.load.image('pressStart', 'img/press-start.png');
    this.load.atlasJSONHash('sprites', 'img/shmup-sprites.png', 'assets/shmup-sprites.json');
    //this.load.spritesheet('projectiles', 'img/shmup-projectiles.png', 12, 14);
  },

  create: function () {
    var that = this;

    this.padding = 36;

    this.background = this.game.add.tileSprite(0, 0, 400, 600, 'background');
    this.background.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.background.autoScroll(0, 30);
    this.background.scale.set(2, 2);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.playerBullets = this.game.add.group();
    this.enemyBullets = this.game.add.group();

    _.times(64, function() {
      that.playerBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/pulse1'), true);
    });
    _.times(64).map(function() {
      that.enemyBullets.add(new Bullet(that.game, 0, 0, 'sprites', 'projectiles/enemy/0000'), true);
    });

    this.createPlayer();
    this.weapon = new Weapon(this.game, this.playerBullets, {fireRate: 120, bulletSpeed: 400, bulletDamage: 50});
    this.game.add.existing(this.weapon);

    this.enemies = new EnemyGenerator(this.game, this.enemyBullets, this.player);

    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.shieldsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.game.add.image(20, 20, this.shieldsText);
    this.updateShields(this.player.shields);

    this.points = 0;
    this.pointsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.game.add.image(260, 20, this.pointsText);
    this.updatePoints();

    this.explosions = new ExplosionGenerator(this.game);
  },

  createPlayer: function () {
    this.player = new Player(this.game, 200, this.world.height - this.padding, 'sprites');
    this.game.add.existing(this.player);
  },

  update: function() {
    if (this.won || this.lost) return;

    this.enemies.spawn();
    this.player.stop();
    if (this.player.x < this.padding) {
      this.player.x = this.padding;
    } else if (this.player.x > this.world.width - this.padding) {
      this.player.x = this.world.width - this.padding;
    }

    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    }

    if (this.fireButton.isDown) {
      this.weapon.fire(this.player);
    }

    this.game.physics.arcade.overlap(this.player, this.enemies, this.enemyCollide, null, this);
    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.enemyHit, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerHit, null, this);
  },

  enemyCollide: function(player, enemy) {
    enemy.kill();
    this.explosions.spawn(enemy);
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
      this.explosions.spawn(enemy);
      this.points += enemy.pointsValue;
      this.updatePoints();
    }
  },

  playerHit: function(player, bullet) {
    player.damageShields(bullet.damageDealt);
    bullet.kill();

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