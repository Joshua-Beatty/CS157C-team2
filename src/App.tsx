import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Game from './Game';
import Login from './Login';
import Register from './Register';
import Profile from './Profile';


function App()
{
    return (
        <Router>
            <Routes>
                {/* Routes / and /home both correspond to Home */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />

                <Route path="/game" element={<Game />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />

            </Routes>
        </Router>
    );
}


export default App
