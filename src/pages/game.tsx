import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from '../PhaserGame';
import { Queue } from '../game/scenes/Queue';
import Link from 'next/link';

function Game()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // Can only ready up if user is in queue
    const [isReady, setCantReady] = useState(true);
    // Can only queue is user is not already queued
    const [isQueued, setIsQueued] = useState(false);

    // Game status message
    const [statusMessage, setStatusMessage] = useState('PRESS QUEUE TO START');

    // ENTER QUEUE
    const enterQueue = () => {
        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as Queue;
            
            if (scene)
            {
                scene.enterQueue();
                setCantReady(false);
                setIsQueued(true);
                setStatusMessage('IN QUEUE - READY UP!');
            }
        }
    }

    // READY UP
    const readyUp = () => {
        if (phaserRef.current)
        {
            const scene = phaserRef.current.scene as Queue;

            if (scene)
            {
                scene.readyUp();
                setCantReady(true);
                setStatusMessage('READY! WAITING FOR GAME START');
            }
        }
    }

    const startGame = () => {
        if (phaserRef.current)
            {
                const scene = phaserRef.current.scene as Queue;
    
                if (scene)
                {
                    scene.changeScene();
                    setStatusMessage('GAME STARTING...');
                }
            }
    }


    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        // setCantMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    useEffect(() => {
        const colors = ['i', 'j', 'l', 'o', 's', 't', 'z'];
        let colorIndex = 0;
        
        const interval = setInterval(() => {
            const buttons = document.querySelectorAll('.button');
            buttons.forEach(button => {
                if (!button.hasAttribute('disabled')) {
                    (button as HTMLElement).style.borderColor = `var(--tetris-${colors[colorIndex]})`;
                }
            });
            
            colorIndex = (colorIndex + 1) % colors.length;
        }, 2000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="game-container">
            {/* Logo at the top */}
            <div className="game-header">
                <div className="type99-logo">
                    <div className="type-text">
                        <span style={{ color: 'var(--tetris-t)' }}>T</span>
                        <span style={{ color: 'var(--tetris-j)' }}>Y</span>
                        <span style={{ color: 'var(--tetris-s)' }}>P</span>
                        <span style={{ color: 'var(--tetris-i)' }}>E</span>
                    </div>
                    <div className="num-text">
                        <span style={{ color: 'var(--tetris-z)' }}>9</span>
                        <span style={{ color: 'var(--tetris-o)' }}>9</span>
                    </div>
                </div>
            </div>
            
            {/* Game content (game screen + control panel) */}
            <div className="game-content">
                {/* Game screen */}
                <div className="game-screen">
                    <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
                </div>
                
                {/* Control panel */}
                <div className="control-panel">
                    <div className="status-message" style={{ 
                        color: 'var(--tetris-o)', 
                        marginBottom: '15px',
                        fontSize: '0.8em',
                        textAlign: 'center'
                    }}>
                        {statusMessage}
                    </div>
                    
                    <div>
                        <button 
                            disabled={isQueued} 
                            className="button queue-button" 
                            onClick={enterQueue}
                        >
                            QUEUE
                        </button>
                    </div>
                    
                    <div>
                        <button 
                            disabled={isReady} 
                            className="button ready-button" 
                            onClick={readyUp}
                        >
                            READY UP
                        </button>
                    </div>
                    
                    <div>
                        <button 
                            className="button start-button" 
                            onClick={startGame}
                        >
                            START GAME
                        </button>
                    </div>
                    
                    <div style={{ marginTop: '20px' }}>
                        <Link href="/profile">
                            <button className="button back-button">
                                BACK TO PROFILE
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game
