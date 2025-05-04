import { useRouter } from 'next/router';
import { useState } from 'react';
// Axios to make HTTP requests simple
import axios from 'axios';

function Login()
{
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            }, { 
                withCredentials: true  // credentials for session
            });

            setMessage(response.data.message);
            // If successful, send user to profile page
            if (response.data.success) {
                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            }

        } catch (error) {
            // if login failed
            setMessage('Login failed');
            console.error(error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                /* username binds to input value */
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /><br /><br />
            <input
                type="password"
                placeholder="Password"
                /* password binds to input value */
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br /><br />
            <button onClick={handleLogin}>Login</button>
            {/* Message displays whether login was successful or not */}
            <p>{message}</p>
        </div>
    );
}

export default Login
