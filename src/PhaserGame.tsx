import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';
import { Game } from './game/scenes/Game'; // Make sure to import your Game scene class
import { Queue } from './game/scenes/Queue';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
    getCurrentGameInfo: () => { gameId: string | null, userId: string | null };
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<Phaser.Scene | null>(null);

    // Function to get current game info
    const getCurrentGameInfo = () => {
        if (sceneRef.current) {
            // Check if it's Game scene
            if (sceneRef.current.scene.key === 'Game') {
                try {
                    const gameScene = sceneRef.current as Game;
                    return {
                        gameId: gameScene.gameId,
                        userId: gameScene.userId
                    };
                } catch (error) {
                    console.error("Error casting to Game scene:", error);
                }
            }
            
            // If we're in Queue scene, we can also get userId from there
            else if (sceneRef.current.scene.key === 'Queue') {
                try {
                    const queueScene = sceneRef.current as Queue;
                    return {
                        gameId: queueScene.queueId, // Use queueId if available
                        userId: queueScene.userId
                    };
                } catch (error) {
                    console.error("Error casting to Queue scene:", error);
                }
            }
        }
        return { gameId: null, userId: null };
    };

    // Expose the component's API through the ref
    useImperativeHandle(ref, () => ({
        game: gameRef.current,
        scene: sceneRef.current,
        getCurrentGameInfo
    }));

    useLayoutEffect(() => {
        if (gameRef.current === null) {
            gameRef.current = StartGame("game-container");
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        }
    }, [ref]);

    useEffect(() => {
        const handleSceneReady = (scene_instance: Phaser.Scene) => {
            // Update scene reference
            sceneRef.current = scene_instance;
            
            if (currentActiveScene) {
                currentActiveScene(scene_instance);
            }
        };

        EventBus.on('current-scene-ready', handleSceneReady);
        
        return () => {
            EventBus.removeListener('current-scene-ready');
        }
    }, [currentActiveScene]);

    return (
        <div id="game-container"></div>
    );
});