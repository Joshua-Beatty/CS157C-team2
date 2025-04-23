import { NavigationButton } from '../components/NavigationButton.js';

export class Login extends Phaser.Scene {

    constructor() {
        super('Login');
    }

    preload() {
        // Preload background image
        this.load.image('background', 'assets/profile_background.png');

    }

    create() {
        // Display background image
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Display log in message
        this.add.text(200, 300, "Welcome to Type99! Please log in or register.", {
            fontSize: '32px'
        });

        // Display login button
        new NavigationButton(this, 640, 400, "Log In", () => {
            this.scene.start('Home');
        });

        // Display register button
        new NavigationButton(this, 640, 500, "Register", () => {
            // Placeholder to navigate to Register page
            // this.scene.start('Register');
        });


    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
