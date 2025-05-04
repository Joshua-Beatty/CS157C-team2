import { useNavigate } from 'react-router-dom';

function Home()
{
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '100px'}}>

            <h1> Welcome to Type99 </h1>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')} style={{ marginLeft: '10px' }}>Register</button>
            <button onClick={() => navigate('/game')} style={{ marginLeft: '10px' }}>Play</button>

        </div>
    )
}

export default Home
