import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    wordsText: Phaser.GameObjects.Text;
    inputText: Phaser.GameObjects.Text;
    words = ['apple', 'breeze', 'cloud', 'orange', 'planet', 'river', 'train', 'tunnel', 'castle', 'ladder', 'mountain', 'puzzle', 'hammer', 'robot', 'crystal', 'eagle', 'flame', 'forest', 'ghost', 'honey', 'chair', 'tiger', 'banana', 'paper', 'garden', 'shadow', 'snow', 'stone', 'window', 'wizard', 'rocket', 'jelly', 'sparkle', 'mirror', 'magic', 'night', 'ocean', 'echo', 'comet', 'laser', 'dragon', 'knight', 'quest', 'legend', 'thunder', 'neon', 'silent', 'pixel', 'energy', 'glitch'];
    
    currentWordIndex = 0;
    wordsInput = '';

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        EventBus.emit('current-scene-ready', this);

        // this.gameText = this.add.text(512, 50, 'Game', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100);

        // Start of game logic

        // Display the 50 words
        this.wordsText = this.add.text(512, 100, this.words.join(' '), {
            fontFamily: 'Consolas', fontSize: '20px', color: '#ffffff', // Consolas is monospaced
            stroke: '#000000', strokeThickness: 4,
            align: 'center',
            wordWrap: {width: 800, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(100);

        this.inputText = this.add.text(512, 400, '', {
            fontFamily: 'Consolas', fontSize: '20px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center',
            wordWrap: {width: 800, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(100);

        // Access keyboard input
        const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;

        keyboard.on('keydown', (event: KeyboardEvent) => {
            // Call function to handle key press
            this.handleKeyPress(event.key);
        });

    }

    handleKeyPress(key: string) {
        if (key === 'Backspace') {
            // Remove most recent key if user presses backspace
            // Do not remove space (makes sure user doesn't remove already completed words)
            if (this.wordsInput[this.wordsInput.length - 1] !== ' ') {
                this.wordsInput = this.wordsInput.slice(0, -1);
            }
        }
        else if (key === ' ') {
            // Check if word is correct if user presses space
            
            // Get most recent space-separated word, or '' if no words
            const currentWord = this.wordsInput.split(' ').pop() || '';

            if (currentWord === this.words[this.currentWordIndex]) {
                this.wordsInput += key;
                this.currentWordIndex++;

            }
        }
        // Only accept alphanumeric characters as user input
        else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
            // Add this key to typedText
            this.wordsInput += key;
        }

        this.inputText.setText(this.wordsInput);



    }




    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
