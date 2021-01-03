import Phaser from './lib/phaser.js';

import Game from './scenes/Game.js';
import GameOver from './scenes/GameOver.js';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  parent: 'game-container',
  scene: [Game, GameOver],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 500
      },
      debug: true
    }
  }
});