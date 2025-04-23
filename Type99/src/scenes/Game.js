import { NavigationButton } from '../components/NavigationButton.js';

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    preload() {
    // Preload background image
        this.load.image('background', 'assets/profile_background.png');
    
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Display text for queue
        this.add.text(360, 400, "Currently queueing for a game...", {
            fontSize: '32px'
        })

        new NavigationButton(this, 640, 500, "Exit queue", () => {
            this.scene.start('Home');
        });

    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
