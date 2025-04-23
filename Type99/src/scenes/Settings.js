import { NavigationButton } from '../components/NavigationButton.js';

export class Settings extends Phaser.Scene {

    constructor() {
        super('Settings');
    }

    preload() {
        // Preload background image
        this.load.image('background', 'assets/profile_background.png');

    }

    create() {
        // Display background image
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Display navigation buttons
        new NavigationButton(this, 150, 50, "Go to Home", () => {
            this.scene.start('Home');
        });

        new NavigationButton(this, 450, 50, "Go to Profile", () => {
            this.scene.start('Profile');
        });

        new NavigationButton(this, 1150, 50, "Sign Out", () => {
            this.scene.start('Login');
        });


        // Display text for settings
        this.add.text(420, 160, "Customize your settings.", {
            fontSize: '32px'
        })

    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
