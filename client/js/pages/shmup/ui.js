'use strict';

function UI(game) {
  this.game = game;

  this.clean = {};

  this.shieldsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
  this.game.add.image(20, 20, this.shieldsText);

  this.pointsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
  this.game.add.image(260, 20, this.pointsText);
}

UI.prototype.update = function(currentValues) {
  if (currentValues.shields !== this.clean.shields) {
    this.shieldsText.text = _.padLeft(currentValues.shields, 3, '0');
  }
  if (currentValues.points !== this.clean.points) {
    this.pointsText.text = _.padLeft(currentValues.points, 6, '0');
  }
  this.clean = currentValues;
};

module.exports = UI;