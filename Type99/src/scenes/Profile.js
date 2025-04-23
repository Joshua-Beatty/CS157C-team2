import { NavigationButton } from '../components/NavigationButton.js';

export class Profile extends Phaser.Scene {

    constructor() {
        super('Profile');
    }

    preload() {
        // Preload background image
        this.load.image('background', 'assets/profile_background.png');
        //this.load.image('logo', 'assets/phaser.png');

        // Preload profile icon
        this.load.image('profile_icon', 'assets/character_profile.png');

    }

    create() {
        // Display background image
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Display navigation buttons
        new NavigationButton(this, 150, 50, "Go to Home", () => {
            this.scene.start('Home');
        });

        new NavigationButton(this, 950, 50, "Settings", () => {
            this.scene.start('Settings');
        });

        new NavigationButton(this, 1150, 50, "Sign Out", () => {
            this.scene.start('Login');
        });

        // Display profile icon
        const profile_icon = this.add.image(100, 200, 'profile_icon').setScale(4);


        // Display text for profile
        this.add.text(50, 280, "Hello testuser, welcome to your profile page.", {
            fontSize: '32px'
        })



        // Display user statistics
        this.add.text(50, 380, "Your Type99 statistics are listed below.", {
            fontSize: '32px'
        })

    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
