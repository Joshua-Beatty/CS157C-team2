import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import axios from 'axios';

export class Game extends Scene
{
    // Keep track of this game client's player
    userId: string | null = null;
    userHp: number | null = null;
    userWordCount: number | null = null;

    // Keep track of this game's ID
    gameId: string | null = null;

    // Keep track of if game started (wait for last readied player to create game)
    gameStarted: boolean | null = null;
    // Keep track of game end (ends when only 1 player alive)
    gameOver: boolean | null = null

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    wordsText: Phaser.GameObjects.Text;
    inputText: Phaser.GameObjects.Text;
    wordBank = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon', 'apricot', 'blueberry', 'cantaloupe', 'dragonfruit', 'eggplant', 'fennel', 'guava', 'hibiscus', 'iceberg', 'jalapeno', 'kumquat', 'lime', 'mulberry', 'nectarine', 'olive', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'rhubarb', 'starfruit', 'tomato', 'unique', 'yam', 'zucchini', 'acorn', 'bagel', 'cat', 'dog', 'elephant', 'frog', 'giraffe', 'horse', 'iguana', 'jellyfish', 'kangaroo', 'lion', 'monkey', 'narwhal', 'octopus', 'parrot', 'quail', 'rabbit', 'snake', 'tiger', 'umbrella', 'vulture', 'walrus', 'xylophone', 'yak', 'zebra', 'antelope', 'bear', 'cow', 'dolphin', 'eagle', 'fox', 'gorilla', 'hippopotamus', 'iguana', 'jaguar', 'koala', 'lemur', 'moose', 'newt', 'opossum', 'penguin', 'quokka', 'raccoon', 'sloth', 'toucan', 'unicorn', 'viper', 'whale', 'xerus', 'yellowjacket', 'zebra', 'albatross', 'baboon', 'cactus', 'dingo', 'elk', 'fern', 'gecko', 'hawk', 'owl', 'penguin', 'quail', 'rooster', 'sparrow', 'toucan', 'vulture', 'warbler', 'xenops', 'yodeler', 'zebra', 'artichoke', 'blueberry', 'cabbage', 'daffodil', 'eucalyptus', 'fern', 'ginseng', 'hibiscus', 'ivy', 'juniper', 'kelp', 'lavender', 'marigold', 'nasturtium', 'oregano', 'petunia', 'quinoa', 'rosemary', 'sage', 'thyme', 'violet', 'wisteria', 'xenia', 'yucca', 'zinnia', 'acorn', 'ball', 'clock', 'door', 'elephant', 'flag', 'grape', 'hat', 'ink', 'jug', 'kite', 'lemon', 'mask', 'nut', 'octagon', 'park', 'queen', 'radio', 'ship', 'train', 'umbrella', 'vest', 'wagon', 'xylophone', 'yellow', 'zebra', 'axis', 'break', 'crane', 'drum', 'end', 'flare', 'gap', 'hunt', 'icon', 'joke', 'key', 'love', 'mark', 'neck', 'oval', 'park', 'quiz', 'rest', 'snap', 'tale', 'unit', 'void', 'wall', 'yoke', 'zest', 'arm', 'bend', 'cash', 'die', 'ear', 'fit', 'gun', 'ham', 'ink', 'joy', 'kit', 'lad', 'man', 'net', 'oil', 'pen', 'rat', 'sun', 'toy', 'urn', 'vat', 'win', 'yak', 'zip', 'aim', 'ball', 'coat', 'dust', 'egg', 'fan', 'grid', 'horn', 'ink', 'jam', 'log', 'mix', 'nap', 'odd', 'pit', 'rug', 'saw', 'tin', 'undo', 'vet', 'wig', 'you', 'zip', 'amber', 'bench', 'coat', 'deck', 'epic', 'fame', 'gear', 'hand', 'ice', 'jam', 'king', 'log', 'map', 'net', 'oak', 'pet', 'quiz', 'rug', 'sap', 'top', 'urn', 'van', 'web', 'yam', 'zoo', 'angle', 'bar', 'cast', 'deal', 'eel', 'flat', 'gash', 'heat', 'icon', 'jolt', 'king', 'lace', 'mile', 'net', 'oak', 'pit', 'queen', 'rag', 'sat', 'tin', 'urn', 'vet', 'win', 'yet', 'zone', 'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu'];
    // words = ['apple', 'breeze', 'cloud', 'orange', 'planet', 'river', 'train', 'tunnel', 'castle', 'ladder', 'mountain', 'puzzle', 'hammer', 'robot', 'crystal', 'eagle', 'flame', 'forest', 'ghost', 'honey', 'chair', 'tiger', 'banana', 'paper', 'garden', 'shadow', 'snow', 'stone', 'window', 'wizard', 'rocket', 'jelly', 'sparkle', 'mirror', 'magic', 'night', 'ocean', 'echo', 'comet', 'laser', 'dragon', 'knight', 'quest', 'legend', 'thunder', 'neon', 'silent', 'pixel', 'energy', 'glitch'];
    wordList: string[];
    zoneList: string[];
    // To store status of other players during game
    playerHps: null
    playerScores: null

    currentWordIndex = 0;
    wordsInput = '';

    constructor ()
    {
        super('Game');
    }

    async create ()
    {
        // Get game from backend
        await this.startGameFromBackend();

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
        this.wordsText = this.add.text(512, 200, this.wordList.join(' '), {
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


    // Upon game start, fetch game info from backend
    async startGameFromBackend() {
        // Get player who is last to ready
        try {
            const response = await axios.get("http://localhost:5000/lastready", {
                withCredentials: true
            });

            // Set this.gameId
            this.gameId = response.data.gameId;

            this.userId = await axios.get("http://localhost:5000/user", {
                withCredentials: true
            });

            // This user is the one who readied up last
            if (this.userId == response.data.lastReady) {

                // Generate first 10 words randomly using this.wordBank
                this.wordList = this.wordBank.sort(() => 0.5 - Math.random()).slice(0, 10);

                // Call startgame endpoint
                const gameResponse = await axios.post("http://localhost:5000/startgame", {
                    gameId: this.gameId,
                    wordList: this.wordList
                }, {
                    withCredentials: true
                });

                if (gameResponse.data.success) {
                    this.updateGameStatusWhile();
                }



            }
            else {
                // wait for game data to appear in database
                this.waitGameStartWhile();


            }
        }
        catch (error) {
            console.log(error);
        }
        

    }

    async waitGameStartWhile() {

        // Wait for game while game is not started
        while (!this.gameStarted) {
            this.waitGameStart();

            // Check for game ready every 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Game has started, so fetch it
        try {

            const response = await axios.post("http://localhost:5000/fetchgame", {
                gameId: this.gameId
            }, {
                withCredentials: true
            });

            // Populate wordList
            this.wordList = response.data.wordList;
            // Populate zoneList
            this.zoneList = response.data.zoneList;

            this.updateGameStatusWhile();


        }
        catch (error) {
            console.log(error);
        }

    }

    async waitGameStart() {
        try {
            const response = await axios.post("http://localhost:5000/checkgameready", {
                gameId: this.gameId
            }, {
                withCredentials: true
            });

            if (response.data.gameReady == true) {
                this.gameStarted = true;
            }

        }
        catch (error) {
            console.log(error);
        }
    }


    async updateGameStatusWhile() {
        // Update game status as long as game is not over
        while (!this.gameOver) {
            this.updateGameStatus();

            // Update game status every 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }


    }


    async updateGameStatus() {
        try {
            const response = await axios.post("http://localhost:5000/fetchgame", {
                gameId: this.gameId
            }, {
                withCredentials: true
            });

            // Update fields at top of class
            this.playerHps = response.data.playerHps;
            this.playerScores = response.data.playerScores;
            this.wordList = response.data.wordList;
            this.zoneList = response.data.zoneList;

        }
        catch (error) {
            console.log(error);
        }
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
                if (currentWord === this.wordList[this.currentWordIndex]) {
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
        // this.scene.start('GameOver');
    }
}
