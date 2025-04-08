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

        // Display profile icon
        const profile_icon = this.add.image(100, 200, 'profile_icon').setScale(4);
        //profile_icon.displayHeight = 200;
        //profile_icon.displayWidth = 200;

        // Display text for profile
        this.add.text(50, 280, "Hello testuser, welcome to your profile page.", {
            fontSize: '32px'
        })

        new NavigationButton(this, 1100, 50, "Sign Out", () => {
            this.scene.start('Login');
        });

        // Display user statistics
        this.add.text(50, 380, "Your Type99 statistics are listed below.", {
            fontSize: '32px'
        })

        //const logo = this.add.image(640, 200, 'logo');

        //const ship = this.add.sprite(640, 360, 'ship');

        /*
        ship.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });

        ship.play('fly');

        this.tweens.add({
            targets: logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });
        */
    }

// Called per frame (60 FPS)
    update() {
        // this.background.tilePositionX += 2;
    }
    
}
