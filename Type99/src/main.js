import { Home } from './scenes/Home.js';
import { Profile } from './scenes/Profile.js';
import { Login } from './scenes/Login.js';
import { Game } from './scenes/Game.js';
import { Settings } from './scenes/Settings.js';

const config = {
    type: Phaser.AUTO,
    title: 'Type99',
    description: 'Multiplayer battle royale typing game',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Login,
        Home,
        Profile,
        Game,
        Settings
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            