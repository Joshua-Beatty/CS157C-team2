import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import axios from 'axios';

export class Queue extends Scene
{
    queueId: string | null = null;
    // Update queue status periodically
    queueUpdateInterval: NodeJS.Timeout | null = null;

    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    queueText: GameObjects.Text;
    readyText: GameObjects.Text;
    playersReadyText: GameObjects.Text;
    gameStartText: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor ()
    {
        super('Queue');
    }

    create ()
    {
        //this.background = this.add.image(512, 384, 'background');

        //this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 100, 'Queue', {
            fontFamily: 'Arial Black', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.queueText = this.add.text(512, 300, 'Press Queue to find a game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        
        this.readyText = this.add.text(512, 450, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.playersReadyText = this.add.text(512, 500, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.gameStartText = this.add.text(512, 550, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        // if (this.logoTween)
        // {
        //     this.logoTween.stop();
        //     this.logoTween = null;
        // }

        this.scene.start('Game');
    }



    // Enter queue when Enter Queue button is pressed
    async enterQueue()
    {
        try {
            const response = await axios.post('http://localhost:5000/enterqueue', {}, {
                withCredentials: true
            });

            if (response.data.success) {
                // GET QUEUE ID FROM REDIS
                this.queueId = response.data.queueId;

                const queueSize = response.data.queueSize;
                this.queueText.setText(`Players currently in queue: ${queueSize}`);

                this.readyText.setText('You are not ready.');

                const readySize = response.data.readySize;
                this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);

                this.gameStartText.setText('Game will start when all players are ready.');

                // Start updating queue status periodically
                if (!this.queueUpdateInterval) {
                    this.queueUpdateInterval = setInterval(() => this.updateQueueStatus(), 1000);
                }
            }

        }
        catch (error) {
            this.queueText.setText("Failed to enter queue");
            console.error(error);
        }
    }


    async updateQueueStatus() {
        // Only update queue status if user is currently in queue
        if (!this.queueId) {
            return;
        }
        else {
            try {
                const response = await axios.post('http://localhost:5000/queuestatus', {
                    queueId: this.queueId,
                }, {
                    withCredentials: true
                });
    
                if (response.data.success) {
                    // Update queueText and readyText with updated queue and ready players
                    const queueSize = response.data.queueSize;
                    this.queueText.setText(`Players currently in queue: ${queueSize}`);
    
                    const readySize = response.data.readySize;
                    this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);
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

    async readyUp()
    {
        try {
            const response = await axios.post('http://localhost:5000/readyup', {
                // Send lobbyId
                queueId: this.queueId,
            }, {
                withCredentials: true
            });

            if (response.data.success) {

                // Update queueText and readyText with updated queue and ready players
                const queueSize = response.data.queueSize;
                this.queueText.setText(`Players currently in queue: ${queueSize}`);

                this.readyText.setText('You are ready.');

                const readySize = response.data.readySize;
                this.playersReadyText.setText(`Players ready: ${readySize} / ${queueSize}`);
            }

        }
        catch (error) {
            this.readyText.setText("Failed to ready up");
            console.error(error);
        }
    }

}
