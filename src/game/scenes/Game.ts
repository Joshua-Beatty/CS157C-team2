import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import axios from 'axios';

export class Game extends Scene {
    // Make properties private
    private _gameId: string | null = null;
    private _userId: string | null = null;
    
    // Provide getters
    public get gameId(): string | null {
        return this._gameId;
    }
    
    public get userId(): string | null {
        return this._userId;
    }

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    decorativeBlocks: Phaser.GameObjects.Rectangle[] = []; // For Tetris-style blocks

    // Keep track of this game client's player
    userHp: number = 5;

    // Keep track of this game's ID
    static currentGameId: string | null = null;

    // Keep track of if game started (wait for last readied player to create game)
    gameStarted: boolean = false;
    // Keep track of game end (ends when only 1 player alive)
    gameOver: boolean = false;
    died: boolean = false;

    // Contains text to be displayed on screen
    wordsText: Phaser.GameObjects.Text;
    inputText: Phaser.GameObjects.Text;
    healthText: Phaser.GameObjects.Text;
    zoneText: Phaser.GameObjects.Text;
    killsText: Phaser.GameObjects.Text;
    leaderText: Phaser.GameObjects.Text;

    // Top 10 list of players
    topTenText: Phaser.GameObjects.Text;
    firstPlayer: Phaser.GameObjects.Text;
    secondPlayer: Phaser.GameObjects.Text;
    thirdPlayer: Phaser.GameObjects.Text;
    fourthPlayer: Phaser.GameObjects.Text;
    fifthPlayer: Phaser.GameObjects.Text;
    sixthPlayer: Phaser.GameObjects.Text;
    seventhPlayer: Phaser.GameObjects.Text;
    eighthPlayer: Phaser.GameObjects.Text;
    ninthPlayer: Phaser.GameObjects.Text;
    tenthPlayer: Phaser.GameObjects.Text;

    // Accumulated word list
    wordList: string[] = [];
    // Current 10 words for user to type
    wordLine: string[] = [];
    // Current word the user is on in the line
    currentWordIndex = 0;
    // Current line the user is on
    currentLineIndex = 0;
    // User input
    wordsInput = '';
    
    // Zone properties
    inZone: boolean = false;
    //playerHealth: number = 100; // Initial health value
    kills: number = 0;
    isLeader: boolean = false;
    
    // To store status of other players during game
    playerHps: Record<string, number> | null = null;
    playerWordLines: Record<string, number> | null = null;

    async getUserInfo() {
        try {
            const response = await axios.get("http://localhost:3000/user", {
                withCredentials: true
            });
            
            if (response.data.success) {
                this._userId = response.data.user;
                console.log(`User ID set: ${this._userId}`);
                return true;
            } else {
                console.error("Failed to get user info:", response.data.message);
                return false;
            }
        } catch (error) {
            console.error("Error getting user info:", error);
            return false;
        }
    }

    constructor () {
        super('Game');
    }

    async startGame() {
        // Check if we have user info, if not, wait for it
        if (!this._userId) {
            const success = await this.getUserInfo();
            if (!success) {
                this.add.text(512, 384, 'Error loading user info. Please refresh.', {
                    fontFamily: '"Press Start 2P"', 
                    fontSize: '20px', 
                    color: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);
                return;
            }
        }
        
        // Now start the game backend
        await this.startGameFromBackend();
    }

    // First thing to run when Game scene is created
    preload () {
        // Load the WebFont script dynamically
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
        
        // Register the complete event handler FIRST
        this.load.on('complete', () => {
            // This ensures preload is truly done before proceeding
            this.startGame();
        });
        
        // Also start the user info fetch in parallel
        this.getUserInfo();
    }

    create () {
        // Wait for WebFont to load
        (window as any).WebFont.load({
            google: {
                families: ['Press Start 2P']
            },
            active: () => {
                this.createGameElements();
            }
        });
    }
    
    createGameElements() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00cc66); // Slightly deeper green
        
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        this.background.setDepth(0);
        
        // Add decorative Tetris-style blocks
        this.addDecorativeBlocks();

        EventBus.emit('current-scene-ready', this);

        // Create wordsText to display current words to type
        this.wordsText = this.add.text(512, 200, '', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '18px', 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 6,
            align: 'center',
            wordWrap: {width: 800, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(100);

        // Create inputText to display this player's current input
        this.inputText = this.add.text(512, 400, '', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 6,
            align: 'center',
            wordWrap: {width: 800, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(100);

        // Create health display
        this.healthText = this.add.text(100, 50, 'Health: 5', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 6
        }).setDepth(100);
        
        // Create zone status display
        this.zoneText = this.add.text(100, 130, 'Zone: Safe', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#00ff00',
            stroke: '#000000', 
            strokeThickness: 6
        }).setDepth(100);

        // Create top 10 players display
        this.topTenText = this.add.text(100, 90, 'Current Top 10', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#00ff00',
            stroke: '#000000', 
            strokeThickness: 6
        }).setDepth(100);
        
        // Create kills display
        this.killsText = this.add.text(800, 50, 'Kills: 0', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#ffffff',
            stroke: '#000000', 
            strokeThickness: 6
        }).setDepth(100);
        
        // Create leader status
        this.leaderText = this.add.text(800, 80, '', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '16px', 
            color: '#ffff00',
            stroke: '#000000', 
            strokeThickness: 6
        }).setDepth(100);

        // Access keyboard input
        const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;

        keyboard.on('keydown', (event: KeyboardEvent) => {
            // Call function to handle key press
            this.handleKeyPress(event.key);
        });
    }
    
    // Add Tetris blocks as decoration (similar to Queue.ts)
    addDecorativeBlocks() {
        // Colors for Tetris pieces
        const colors = [
            0xa000f0, // T piece - purple
            0x0000f0, // J piece - blue
            0x00f000, // S piece - green
            0x00f0f0, // I piece - cyan
            0xf00000, // Z piece - red
            0xf0f000  // O piece - yellow
        ];
        
        // Get canvas dimensions for block positioning
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add some falling blocks that appear at the edges of the screen
        for (let i = 0; i < 12; i++) {
            // Position blocks mostly at the edges to not interfere with gameplay
            const x = i % 2 === 0 ? 
                Phaser.Math.Between(20, 150) : 
                Phaser.Math.Between(width - 150, width - 20);
            
            const y = Phaser.Math.Between(20, height - 20);
            const size = Phaser.Math.Between(15, 30);
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            
            const block = this.add.rectangle(x, y, size, size, color)
                .setAlpha(0.4)
                .setDepth(10);
                
            // Store reference to block for later use
            this.decorativeBlocks.push(block);
                
            // Animate the block to fall to the bottom of the screen
            this.tweens.add({
                targets: block,
                y: height + size,
                duration: Phaser.Math.Between(5000, 10000),
                ease: 'Linear',
                repeat: -1,
                yoyo: false,
                delay: Phaser.Math.Between(0, 3000)
            });
        }
    }

    // Upon game start, fetch game info from backend
    async startGameFromBackend() {
        // Game is not started yet
        // The last readied user will start it
        if (!this.gameStarted) {
            try {
                // Retrieve last readied user
                if (!this._userId) {
                    const success = await this.getUserInfo();
                    if (!success) return;
                }

                if (!Game.currentGameId) {
                    const response = await axios.get("http://localhost:3000/lastready", {
                        withCredentials: true
                    });
                    Game.currentGameId = response.data.gameId;
                    const lastReadyUser = response.data.lastReady;

                    // Set this.gameId
                    this._gameId = Game.currentGameId;
                    // Check if this current user == last readied user
                    if (this._userId == lastReadyUser) {
                        try {
                            const gameResponse = await axios.post("http://localhost:3000/startgame", {
                                gameId: this._gameId,
                                user: this._userId
                            }, {
                                withCredentials: true
                            });
                            
                            if (gameResponse.data.success) {
                                this.gameStarted = true;

                                // Fetch the first line of words
                                this.wordLine = await this.fetchWordLine(this.currentLineIndex);

                                await this.fetchGameStatusWhile();
                            } else {
                                console.log("Failed to start game:", gameResponse.data.message);
                                // Maybe implement a retry mechanism or fallback
                            }
                        } catch (error) {
                            console.error("Error starting game:", error);
                        }
                    }
                    // Not readied user
                    else {
                        // Wait for game data to appear in database
                        await this.waitGameStartWhile();
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    // Loop for checking if game is started (for all players besides last readied player)
    async waitGameStartWhile() {

        // Wait for game while game is not started
        while (!this.gameStarted) {
            await this.waitGameStart();

            // Check for game ready every 1 second
            // await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Game has started, so fetch it
        try {

            // Enter loop to fetch game status
            await this.fetchGameStatusWhile();


        }
        catch (error) {
            console.log(error);
        }

    }

    // Called per loop of waitGameStartWhile()
    async waitGameStart() {
        try {
            // Check if game is ready in Redis database, pass gameId to backend
            const response = await axios.post("http://localhost:3000/checkgameready", {
                gameId: this._gameId
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

    // Loop for fetching  game status (updating display)
    async fetchGameStatusWhile() {
        // Update game status as long as game is not over
        while (!this.gameOver && this.scene.isActive()) {
            try {
                await this.fetchGameStatus();
            } catch (error) {
                console.error("Error fetching game status:", error);
                // If we encounter an error (like player removed from game), terminate the loop
                this.gameOver = true;
                break;
            }
        }
    
        console.log("Game loop terminated");

    }

    // Fetches words for player's current line
    async fetchWordLine(lineIndex: number): Promise<string[]> {
        try {
          const response = await axios.post("http://localhost:3000/getWordLine", {
            gameId: this._gameId,
            lineIndex: lineIndex
          }, {
            withCredentials: true
          });
          
          if (response.data.success) {
            return response.data.words;
          } else {
            console.error("Failed to fetch word line:", response.data.message);
            return [];
          }
        } catch (error) {
          console.error("Error fetching word line:", error);
          return [];
        }
      }

    // Called per loop of fetchGameStatusWhile()
    async fetchGameStatus() {
        try {
            // Check if scene is still active before proceeding
            if (!this.scene.isActive()) {
                console.log("Scene is no longer active, aborting fetchGameStatus");
                this.gameOver = true;
                return;
            }

            const response = await axios.post("http://localhost:3000/fetchgame", {
                gameId: this._gameId,
                user: this._userId
            }, {
                withCredentials: true
            });

            // Check if the response indicates the player is no longer in the game
            if (!response.data.success) {
                console.log("Player no longer in game");
                this.gameOver = true;
                return;
            }

            // Double check scene is still active before updating UI
            if (!this.scene.isActive()) {
                console.log("Scene became inactive during fetch, aborting update");
                this.gameOver = true;
                return;
            }

            if (response.data.gameEnded) {
                this.gameOver = true;
                
                if (response.data.isWinner) {
                    this.playerWin();
                }
                
                return; // Exit the method early since game is over
            }
    
            // Update fields
            this.playerHps = response.data.playerHps;
            this.playerWordLines = response.data.playerWordLines;
            this.isLeader = response.data.isLeader;
            if (this.isLeader) {
                if (this.leaderText && this.leaderText.scene) {
                    this.leaderText.setText('LEADER');
                    this.leaderText.setColor('#ffff00');
                }
            } else {
                if (this.leaderText && this.leaderText.scene) {
                    this.leaderText.setText(''); // Clear the leader text
                }
            }
            this.inZone = response.data.inZone;
            this.died = response.data.died;

            // If we need to fetch a new line of words
            if (this.wordLine.length === 0) {
                this.wordLine = await this.fetchWordLine(this.currentLineIndex);
            }
            
            // Update display

            if (this.wordsText && this.wordsText.scene) {
                this.wordsText.setText(this.wordLine.join(' '));
            }
            
            if (this.healthText && this.healthText.scene) {
                this.healthText.setText(`Health: ${this.userHp}`);
            }

            if (this.inZone) {
                this.zoneText.setText('Zone: DANGER!');
                this.zoneText.setColor('#ff0000');
            } else {
                this.zoneText.setText('Zone: Safe');
                this.zoneText.setColor('#00ff00');
            }

            if (this.died && this.scene.isActive()) {
                this.playerDied();
            }
        }
        catch (error) {
            console.log(error);
            this.gameOver = true;
            throw error;
        }
    }

    async handleKeyPress(key: string) {
        if (this.currentWordIndex < this.wordLine.length) {
            if (key === 'Backspace') {
                // Remove most recent key if user presses backspace
                // Do not remove space (makes sure user doesn't remove already completed words)
                if (this.wordsInput[this.wordsInput.length - 1] !== ' ') {
                    this.wordsInput = this.wordsInput.slice(0, -1);
                }
            }
            else if (key === ' ') {
                // Check if word is correct if user presses space
                
                // Get most recent space-separated inputted word, or '' if no words
                const currentWord = this.wordsInput.split(' ').pop() || '';
    
                // Word is correct
                if (currentWord === this.wordLine[this.currentWordIndex]) {
                    this.wordsInput += key;
                    this.currentWordIndex++;
                    
                    // Add a flash effect for correct word
                    this.cameras.main.flash(100, 0, 255, 0, true);

                    // Check if user is done
                    if (this.currentWordIndex === this.wordLine.length) {
                        await this.goToNextLine();
                    }
                    // User is not done
                    else {
                        await this.updateGameStatus();
                    }
                }
                // Word is not correct
                else {
                    // Add a shake effect for incorrect word
                    this.cameras.main.shake(100, 0.01);
                    await this.updateGameStatus();
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

    // When the user finishes typing all words in the current line
    async goToNextLine() {
        // Increment current line the user is on
        this.currentLineIndex++;
        // Reset current word index of the user
        this.currentWordIndex = 0;
        // Clear input words
        this.wordsInput = '';
        
        // Add a level complete effect
        this.cameras.main.flash(200, 0, 255, 255, true);
        
        await this.updateGameStatus();

        // Fetch the next line of words from the backend
        this.wordLine = await this.fetchWordLine(this.currentLineIndex);
        
        // Update display with new words
        if (this.wordsText && this.wordsText.scene) {
            this.wordsText.setText(this.wordLine.join(' '));
        }

        // If player is leading, update leader
        if (this.isLeader) {
            console.log(`I AM THE LEADER - generating new words at line ${this.currentLineIndex}`);
            await this.updateLeaderStatus();
        }
    }

    // Update game status in Redis database after each completed word
    async updateGameStatus() {
        try {
            const response = await axios.post("http://localhost:3000/updategame", {
                gameId: this._gameId,
                hp: this.userHp,
                currentLineIndex: this.currentLineIndex,
                user: this._userId
            }, {
                withCredentials: true
            });
            this.userHp = response.data.playerHp;
        }
        catch (error) {
            console.log(error);
        }
    }

    // Update leader status and zone position (only called by leader)
    async updateLeaderStatus() {
        try {
            const response = await axios.post("http://localhost:3000/updateleader", {
                gameId: this._gameId,
                currentLineIndex: this.currentLineIndex,
                leader: this._userId
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                // Only the leader calls this function
                this.leaderText.setText('LEADER');
                this.leaderText.setColor('#ffff00');
                
                // Add a crown effect or animation for the leader
                this.tweens.add({
                    targets: this.leaderText,
                    scale: 1.2,
                    duration: 300,
                    yoyo: true,
                    repeat: 1
                });

                this.getLeaderKills();
            }
        } catch (error) {
            console.log("Error updating leader status:", error);
        }
    }

    // Get leader kills
    async getLeaderKills() {
        try {
            const response = await axios.post("http://localhost:3000/getleaderkills", {
                gameId: this._gameId,
                leader: this._userId
            }, {
                withCredentials: true
            });
            
            if (response.data.success) {
                this.kills = response.data.kills;
                this.killsText.setText(`Kills: ${this.kills}`);
                
                // Add visual effect for new kill
                if (this.kills > 0) {
                    this.tweens.add({
                        targets: this.killsText,
                        scale: 1.2,
                        duration: 200,
                        yoyo: true,
                        repeat: 1
                    });
                }
            }
        } catch (error) {
            console.log("Error getting kills:", error);
        }
    }

    // Handles player dying
    playerDied() {
        this.gameOver = true;
        
        // Create game over text with better styling
        const gameOverText = this.add.text(512, 500, 'ELIMINATED BY ZONE!', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '32px', 
            color: '#ff0000',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Add dramatic game over effects
        this.cameras.main.flash(1000, 255, 0, 0);
        this.cameras.main.shake(500, 0.02);
        
        // Fade out decorative blocks
        this.decorativeBlocks.forEach(block => {
            this.tweens.add({
                targets: block,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
        
        // Pulse the game over text
        this.tweens.add({
            targets: gameOverText,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    playerWin() {
        const victoryText = this.add.text(512, 384, 'VICTORY ROYALE!', {
            fontFamily: '"Press Start 2P"', 
            fontSize: '32px', 
            color: '#ffff00',
            stroke: '#000000', 
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Add effects, animation, etc.
        this.cameras.main.flash(1000, 255, 255, 0);
        
        this.tweens.add({
            targets: victoryText,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    public leaveGame() {
        console.log("Player leaving game - terminating game loop");
        
        // Set gameOver to true to break out of the fetchGameStatusWhile loop
        this.gameOver = true;

        // Reset the static game ID variable
        Game.currentGameId = null;
        this._gameId = null;        // Also reset instance variable
        
        // Remove all event listeners to prevent callbacks after scene is stopped
        this.events.removeAllListeners();
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeAllListeners();
        }
        
        // Cancel all tweens and timers
        this.tweens.killAll();
        this.time.removeAllEvents();
        
        // Nullify references that might try to update after scene is stopped
        this.playerHps = null;
        this.playerWordLines = null;
        
        // Make sure to set a short delay before stopping the scene
        // This gives async operations a chance to clean up
        this.time.delayedCall(100, () => {
            // Clear any ongoing game activities
            if (this.scene) {
                this.scene.stop();
            }
        });
    }


    changeScene() {
        // this.scene.start('GameOver');
    }
}