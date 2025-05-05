import { useRouter } from 'next/router';
import { useEffect, useState} from 'react';
import axios from 'axios';

function Profile()
{
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Upon loading profile, check if user is logged in
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:3000/profile', { withCredentials: true});
                setMessage(response.data.message);
                if (response.data.success) {
                    setIsLoggedIn(true);
                }
                else {
                    // Not logged in, so redirect to home
                    setIsLoggedIn(false);
                    setMessage(response.data.message + ' Redirecting to home page...');
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                }
            }
            catch (error) {
                setIsLoggedIn(false);
                setMessage('Error checking session');
            }
        };

        fetchProfile();
    }, [router]);

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


    return (
        <div style={{ textAlign: 'center', marginTop: '100px'}}>
            <button onClick={handleLogout} style={{ position:'absolute', top: '30px', right: '50px'}}>Log Out</button>

            <h1> Profile Page </h1>
            <br /><br />
            <p>{message}</p>

            {isLoggedIn && (<>
                    <br /><br />
                    <p>Play a game!</p>
                    <button onClick={() => {router.push('/game')}}>Play game</button>
                    <br /><br /><br />
                    <p>View your gameplay statistics below.</p>
                </>
            )}
            


        </div>
    )
}

export default Profile
