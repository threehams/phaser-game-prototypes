function AudioComponent(game) {
  this.game = game;
}

AudioComponent.prototype.play = function(sound) {
  this.game.sound.play(sound);
};

module.exports = AudioComponent;