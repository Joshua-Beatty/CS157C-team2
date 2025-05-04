import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    wordsText: Phaser.GameObjects.Text;
    inputText: Phaser.GameObjects.Text;
    wordBank = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon', 'apricot', 'blueberry', 'cantaloupe', 'dragonfruit', 'eggplant', 'fennel', 'guava', 'hibiscus', 'iceberg', 'jalapeno', 'kumquat', 'lime', 'mulberry', 'nectarine', 'olive', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'rhubarb', 'starfruit', 'tomato', 'unique', 'yam', 'zucchini', 'acorn', 'bagel', 'cat', 'dog', 'elephant', 'frog', 'giraffe', 'horse', 'iguana', 'jellyfish', 'kangaroo', 'lion', 'monkey', 'narwhal', 'octopus', 'parrot', 'quail', 'rabbit', 'snake', 'tiger', 'umbrella', 'vulture', 'walrus', 'xylophone', 'yak', 'zebra', 'antelope', 'bear', 'cow', 'dolphin', 'eagle', 'fox', 'gorilla', 'hippopotamus', 'iguana', 'jaguar', 'koala', 'lemur', 'moose', 'newt', 'opossum', 'penguin', 'quokka', 'raccoon', 'sloth', 'toucan', 'unicorn', 'viper', 'whale', 'xerus', 'yellowjacket', 'zebra', 'albatross', 'baboon', 'cactus', 'dingo', 'elk', 'fern', 'gecko', 'hawk', 'owl', 'penguin', 'quail', 'rooster', 'sparrow', 'toucan', 'vulture', 'warbler', 'xenops', 'yodeler', 'zebra', 'artichoke', 'blueberry', 'cabbage', 'daffodil', 'eucalyptus', 'fern', 'ginseng', 'hibiscus', 'ivy', 'juniper', 'kelp', 'lavender', 'marigold', 'nasturtium', 'oregano', 'petunia', 'quinoa', 'rosemary', 'sage', 'thyme', 'violet', 'wisteria', 'xenia', 'yucca', 'zinnia', 'acorn', 'ball', 'clock', 'door', 'elephant', 'flag', 'grape', 'hat', 'ink', 'jug', 'kite', 'lemon', 'mask', 'nut', 'octagon', 'park', 'queen', 'radio', 'ship', 'train', 'umbrella', 'vest', 'wagon', 'xylophone', 'yellow', 'zebra', 'axis', 'break', 'crane', 'drum', 'end', 'flare', 'gap', 'hunt', 'icon', 'joke', 'key', 'love', 'mark', 'neck', 'oval', 'park', 'quiz', 'rest', 'snap', 'tale', 'unit', 'void', 'wall', 'yoke', 'zest', 'arm', 'bend', 'cash', 'die', 'ear', 'fit', 'gun', 'ham', 'ink', 'joy', 'kit', 'lad', 'man', 'net', 'oil', 'pen', 'rat', 'sun', 'toy', 'urn', 'vat', 'win', 'yak', 'zip', 'aim', 'ball', 'coat', 'dust', 'egg', 'fan', 'grid', 'horn', 'ink', 'jam', 'log', 'mix', 'nap', 'odd', 'pit', 'rug', 'saw', 'tin', 'undo', 'vet', 'wig', 'you', 'zip', 'amber', 'bench', 'coat', 'deck', 'epic', 'fame', 'gear', 'hand', 'ice', 'jam', 'king', 'log', 'map', 'net', 'oak', 'pet', 'quiz', 'rug', 'sap', 'top', 'urn', 'van', 'web', 'yam', 'zoo', 'angle', 'bar', 'cast', 'deal', 'eel', 'flat', 'gash', 'heat', 'icon', 'jolt', 'king', 'lace', 'mile', 'net', 'oak', 'pit', 'queen', 'rag', 'sat', 'tin', 'urn', 'vet', 'win', 'yet', 'zone', 'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu'];
    // words = ['apple', 'breeze', 'cloud', 'orange', 'planet', 'river', 'train', 'tunnel', 'castle', 'ladder', 'mountain', 'puzzle', 'hammer', 'robot', 'crystal', 'eagle', 'flame', 'forest', 'ghost', 'honey', 'chair', 'tiger', 'banana', 'paper', 'garden', 'shadow', 'snow', 'stone', 'window', 'wizard', 'rocket', 'jelly', 'sparkle', 'mirror', 'magic', 'night', 'ocean', 'echo', 'comet', 'laser', 'dragon', 'knight', 'quest', 'legend', 'thunder', 'neon', 'silent', 'pixel', 'energy', 'glitch'];
    words = this.wordBank.sort(() => 0.5 - Math.random()).slice(0, 50);

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
        if (this.currentWordIndex < 50) {
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
    
                // Word is correct
                if (currentWord === this.words[this.currentWordIndex]) {
                    this.wordsInput += key;
                    this.currentWordIndex++;
    
                    // Check if user is done
                    if (this.currentWordIndex === 50) {
                        this.completed();
                    }
                    
    
                }
            }
            // Only accept alphanumeric characters as user input
            else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
                // Add this key to typedText
                this.wordsInput += key;
            }
    
            this.inputText.setText(this.wordsInput);
        }
        



    }


    completed() {
        this.add.text(512, 700, 'You have finished typing all the words!', {
            fontFamily: 'Consolas', fontSize: '20px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center',
            wordWrap: {width: 800, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(100);
    }


    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
