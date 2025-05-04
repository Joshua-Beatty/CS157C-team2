import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from '../PhaserGame';
import { MainMenu } from '../game/scenes/MainMenu';
import { Queue } from '../game/scenes/Queue';

function Game()
{
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // Can only ready up if user is in queue
    const [isReady, setCantReady] = useState(true);
    // Can only queue is user is not already queued
    const [isQueued, setIsQueued] = useState(false);

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
                }
            }
    }


    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        // setCantMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <div>
                    <button disabled={isQueued} className="button" onClick={enterQueue}>Queue</button>
                </div>
                <div>
                    <button disabled={isReady} className="button" onClick={readyUp}>Ready Up</button>
                </div>
                <div>
                    <button className="button" onClick={startGame}>Start Game</button>
                </div>
                {/*
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                <div>
                    <button disabled={cantMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
                */}
            </div>
        </div>
    )
}

export default Game
