import { useRouter } from 'next/router';
import { useEffect, useState} from 'react';
import axios from 'axios';

function Profile() {
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSuccess, setIsSuccess] = useState(true);
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');

    // Upon loading profile, check if user is logged in
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:3000/profile', { withCredentials: true});
                setMessage(response.data.message);
                if (response.data.success) {
                    setIsLoggedIn(true);
                    // Now fetch user profile details
                    fetchUserProfile();
                }
                else {
                    // Not logged in, so redirect to home
                    setIsLoggedIn(false);
                    setIsSuccess(false);
                    setMessage(response.data.message + ' Redirecting to home page...');
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                }
            }
            catch (error) {
                setIsLoggedIn(false);
                setIsSuccess(false);
                setMessage('Error checking session');
            }
        };

        fetchProfile();
    }, [router]);

    // Fetch user profile details
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:3000/userprofile', { withCredentials: true });
            if (response.data.success) {
                setUsername(response.data.username);
                setDisplayName(response.data.displayName);
                setEmail(response.data.email);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // User logs out
    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:3000/logout', null, { withCredentials: true});
            setMessage(response.data.message);

            // Redirect to home page
            if (response.data.success) {
                router.push('/');
            }
        }
        catch (error) {
            setMessage('Failed to log out');
        }
    };

    // Navigate to edit profile page
    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    // Tetris piece icons
    const TetrisPiece = ({ type }) => {
        const style = {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: `var(--tetris-${type})`,
            marginRight: '5px',
            verticalAlign: 'middle'
        };
        
        return <span style={style}></span>;
    };


    return (
        <div className="profile-container">
            <button 
                onClick={handleLogout} 
                className="logout-button"
            >
                EXIT GAME
            </button>

            <div className="type99-logo" style={{ margin: '0 auto 30px' }}>
                <div className="type-text" style={{ fontSize: '2.5rem' }}>
                    <span style={{ color: 'var(--tetris-t)' }}>T</span>
                    <span style={{ color: 'var(--tetris-j)' }}>Y</span>
                    <span style={{ color: 'var(--tetris-s)' }}>P</span>
                    <span style={{ color: 'var(--tetris-i)' }}>E</span>
                </div>
                <div className="num-text" style={{ fontSize: '2.5rem' }}>
                    <span style={{ color: 'var(--tetris-z)' }}>9</span>
                    <span style={{ color: 'var(--tetris-o)' }}>9</span>
                </div>
            </div>

            <h1>PLAYER PROFILE</h1>
            
            <div className={`message ${isSuccess ? 'success-message' : 'error-message'}`}>
                <h2>{message}</h2>
            </div>

            {isLoggedIn && (
                <div className="profile-content">
                    <div className="user-info" style={{ 
                        marginTop: '30px',
                        padding: '15px',
                        border: '2px solid var(--tetris-t)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2>PLAYER INFO</h2>
                        <div style={{ textAlign: 'left', marginTop: '20px' }}>
                            <p><TetrisPiece type="t" /> Display Name: {displayName}</p>
                            <p><TetrisPiece type="i" /> Username: {username}</p>
                            <p><TetrisPiece type="j" /> Email: {email}</p>
                        </div>
                        <button 
                            onClick={handleEditProfile}
                            className="button"
                            style={{ 
                                borderColor: 'var(--tetris-t)',
                                width: '150px',
                                fontSize: '0.8em',
                                marginTop: '15px'
                            }}
                        >
                            EDIT PROFILE
                        </button>
                    </div>

                    <div className="stats-container" style={{ 
                        marginTop: '30px',
                        padding: '15px',
                        border: '2px solid var(--tetris-i)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2>GAME STATS</h2>
                        <div style={{ textAlign: 'left', marginTop: '20px' }}>
                            <p><TetrisPiece type="i" /> Wins: 0</p>
                            <p><TetrisPiece type="j" /> Games Played: 0</p>
                            <p><TetrisPiece type="l" /> Average Placement: 0</p>
                            <p><TetrisPiece type="o" /> Kills: 0</p>
                            <p><TetrisPiece type="s" /> Highest Kill Game: 0</p>
                            <p><TetrisPiece type="t" /> Average WPM: 0</p>
                            <p><TetrisPiece type="z" /> Highest WPM: 0</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <p>READY TO PLAY?</p>
                        <button 
                            onClick={() => { router.push('/game') }}
                            className="button"
                            style={{ 
                                borderColor: 'var(--tetris-l)',
                                width: '200px',
                                fontSize: '1em'
                            }}
                        >
                            PLAY GAME
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile