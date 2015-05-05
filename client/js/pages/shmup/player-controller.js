'use strict';

function PlayerController(game, player) {
  this.game = game;

  this.cursors = this.game.input.keyboard.createCursorKeys();
  this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  this.player = player;
}

PlayerController.prototype.update = function() {
  this.player.stop();

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
};

module.exports = PlayerController;