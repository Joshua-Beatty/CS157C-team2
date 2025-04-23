import { NavigationButton } from '../components/NavigationButton.js';

export class Home extends Phaser.Scene {

    constructor() {
        super('Home');
    }

    preload() {
    // Preload background image
        this.load.image('background', 'assets/profile_background.png');
    
    }

    create() {
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Display navigation buttons
        new NavigationButton(this, 150, 50, "Go to Profile", () => {
            this.scene.start('Profile');
        });

        new NavigationButton(this, 950, 50, "Settings", () => {
            this.scene.start('Settings');
        });

        new NavigationButton(this, 1150, 50, "Sign Out", () => {
            this.scene.start('Login');
        });

        new NavigationButton(this, 640, 400, "Queue for a game", () => {
            this.scene.start('Game');
        });

        // Display home text
        this.add.text(540, 300, "Type99", {
            fontSize: '64px'
        });

    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
