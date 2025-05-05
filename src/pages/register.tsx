import { useRouter } from 'next/router';
import { useState } from 'react';
import axios from 'axios';

function Register()
{
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:3000/register', {
                username,
                password
            }, {
                withCredentials: true // credentials for session
            });

            setMessage(response.data.message);
            if (response.data.success) {
                setTimeout(() => {
                    router.push('/login');
                }, 1000);
            }
        }
        catch (error) {
            // if register failed
            setMessage('Registration failed');
            console.error(error);
        }
    }


    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                /* username binds to input value */
                value={username}
                onChange = {(e) => setUsername(e.target.value)}
            /><br /><br />
            <input 
                type="password"
                placeholder="Password"
                /* password binds to input value */
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br /><br />
            <button onClick = {handleRegister}>Create Account</button>
            {/* Message displays whether register was successful or not */}
            <p>{message}</p>
        </div>
    );
}

export default Register
