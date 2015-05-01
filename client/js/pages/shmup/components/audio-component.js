'use strict';

var events = require('../events');

function AudioComponent(game) {
  this.game = game;

  events.playSound.add(this.play, this);
  this.playlist = {};
  this.nextPlay = {};

  // uncomment if sounds get annoying
  //this.game.sound.mute = true;
}

AudioComponent.prototype.play = function(sound, volume, loop) {
  volume = volume || 1.0;
  this.playlist[sound] = [volume, loop];
};

AudioComponent.prototype.update = function() {
  var that = this;

  _.forEach(this.playlist, function(opts, sound) {
    if (that.nextPlay[sound] && that.game.time.time < that.nextPlay[sound]) return;
    that.game.sound.play(sound, opts[0], opts[1]);
    that.nextPlay[sound] = that.game.time.time + 100;
  });
  this.playlist = {};
};

module.exports = AudioComponent;