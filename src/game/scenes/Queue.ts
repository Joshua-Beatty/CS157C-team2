import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import axios from 'axios';

export class Queue extends Scene
{
    queueId: string | null = null;
    // Update queue status periodically
    // queueUpdateInterval: number | null = null;

    // Don't need lastReady, this is handled in Redis database
    // lastReady: boolean | null = null;
    // When user first loads Queue scene, game is not started yet
    gameStarted: boolean = false;

    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    queueText: GameObjects.Text;
    readyText: GameObjects.Text;
    playersReadyText: GameObjects.Text;
    gameStartText: GameObjects.Text;
    // logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('Queue');
    }

    create ()
    {
        //this.background = this.add.image(512, 384, 'background');

        //this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        // Queue Title
        this.title = this.add.text(512, 100, 'Queue', {
            fontFamily: 'Arial Black', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Queue Text
        this.queueText = this.add.text(512, 300, 'Press Queue to find a game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Ready Text
        this.readyText = this.add.text(512, 450, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Number of Players Ready Text
        this.playersReadyText = this.add.text(512, 500, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Game Start Text
        this.gameStartText = this.add.text(512, 550, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    // Once game starts, change scene to Game
    changeScene ()
    {
        this.scene.start('Game');
    }



    // Enter queue when Enter Queue button is pressed
    async enterQueue()
    {
        try {
            const response = await axios.post('http://localhost:3000/enterqueue', {}, {
                withCredentials: true
            });

            if (response.data.success) {
                // Set this.queueId, to indicate that user is in queue
                this.queueId = response.data.queueId;

                // Retrieve queueSize from Redis
                const queueSize = response.data.queueSize;
                this.queueText.setText(`Players currently in queue: ${queueSize}`);

                // User just entered queue, so they are not ready
                this.readyText.setText('You are not ready.');

                // Retrieve readySize from Redis
                const readySize = response.data.readySize;
                this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);

                // Information for game start
                this.gameStartText.setText('Game will start when all players are ready.');

                // Start updating queue status periodically
                await this.updateQueueStatusWhile();
            }

        }
        catch (error) {
            if (this.scene && this.scene.isActive()) {
                this.queueText.setText("Failed to enter queue");
            }
            console.error(error);
        }
    }

    // Loop for updating queue status while in queue
    async updateQueueStatusWhile() {
        while (!this.gameStarted) {
            // Call updateQueueStatus function
            await this.updateQueueStatus();

            // Update queue status every 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Game is started
        if (this.gameStarted) {
            // Set game information text
            this.gameStartText.setText('All players are ready. Starting game...');

            // Wait 1 second before starting game
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.startGame();

        }
        
    }

    // Runs once per loop of updateQueueStatusWhile()
    async updateQueueStatus() {

        // Only update queue status if user is currently in queue
        if (!this.queueId) {
            return;
        }
        // User is currently in queue, so proceed with updating queue status
        else {
            try {
                // Send queueId to backend
                const response = await axios.post('http://localhost:3000/queuestatus', {
                    queueId: this.queueId,
                }, {
                    withCredentials: true
                });
    
                if (response.data.success) {
                    // Update queueText with updated queue size
                    const queueSize = response.data.queueSize;
                    this.queueText.setText(`Players currently in queue: ${queueSize}`);
    
                    // Update playersReadyText with updated ready size
                    const readySize = response.data.readySize;
                    this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);

                    // All players in queue are ready, so start game
                    if (readySize == queueSize) {
                        this.gameStarted = true;
                    }


                }
            }
            catch (error) {
                this.queueText.setText('Failed to get updated queue size');
                this.playersReadyText.setText('Failed to get number of ready players');
                console.error(error);
            }
            
        }
    }

    // Maybe?
    leaveQueue()
    {

    }

    // User clicks Ready Up button
    async readyUp()
    {
        try {
            // Call /readyup endpoint in backend, sneding queueId
            const response = await axios.post('http://localhost:3000/readyup', {
                // Send lobbyId
                queueId: this.queueId,
            }, {
                withCredentials: true
            });

            if (response.data.success) {

                // Update queueText with updated queue size
                const queueSize = response.data.queueSize;
                this.queueText.setText(`Players currently in queue: ${queueSize}`);

                // Update readyText indicating this user is ready
                this.readyText.setText('You are ready.');

                // Update playersReadyText with updated ready size
                const readySize = response.data.readySize;
                this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);


                // Boolean: check if this player is the last player to ready
                // this.lastReady = response.data.lastReady;
                // if (this.lastReady) {
                //     // Set this.gameStarted to true if lastReady
                //     this.gameStarted = true;
                // }


            }

        }
        catch (error) {
            this.readyText.setText("Failed to ready up");
            console.error(error);
        }
    }


    // Game starts
    async startGame() {
        try {
            this.scene.start("Game");
        }
        catch (error) {
            this.gameStartText.setText("Error starting game");
            console.error(error);
        }

    }

}
