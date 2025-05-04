import { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import Home from './Home';
import Game from './Game';


function App()
{
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>
    );
}


export default App
