// Backend

// Imports
const redis = require('redis');
const cors = require('cors');
const express = require('express');
const session = require('express-session');

// Initialize express
const app = express();

app.use(cors({
    origin: 'http://localhost:8080',
    methods: 'GET, POST',
    credentials: true
}));

// To parse JSON
app.use(express.json());

// Initialize session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Redis client
const client = redis.createClient({
    socket: {
        host: '34.173.23.63',
        port: 6379
    }
});

// Connect to Redis
client.connect()
    .then(() => {
        console.log('Connected to Redis');

        // Ping to verify
        return client.ping();
    })
    .then(res => {
        console.log('Redis response:', res);
    })
    .catch(err => {
        console.error('Redis connection error:', err);
});


function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        res.json({ success: false, message: "You are not logged in."});
    }
};


// ENDPOINTS BELOW

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check for any blank fields
    if (!username) {
        console.log("Missing username");
        return res.json({ success: false, message: "Missing username"});
    }
    else if (!password) {
        console.log("Missing password");
        return res.json({ success: false, message: "Missing password"});
    }

    // Check if username exists in Redis database
    const existingPass = await client.get(`user:${username}`);
    if (!existingPass) {
        console.log(`Username ${username} does not exist in Redis database`)
        return res.json({ success: false, message: "Username does not exist"});
    }
    // Username does exist, so check if password matches
    else if (password === existingPass){
        // Store user in session
        req.session.user = username;

        console.log(`User ${username} successfully logged in`);
        return res.json({ success: true, message: "Log in successful"});
    }
    // Password does not match
    else {
        console.log(`Incorrect passworrd for user ${username}`);
        return res.json({ success: false, message: "Incorrect password"});

    }

});


// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check for any blank fields
    if (!username) {
        console.log("Missing username");
        return res.json({ success: false, message: "Missing username"});
    }
    else if (!password) {
        console.log("Missing password");
        return res.json({ success: false, message: "Missing password"});
    }

    // Check if username already exists in Redis database
    const existingUser = await client.get(`user:${username}`);
    if (existingUser) {
        console.log(`Username ${username} already exists in Redis database`);
        return res.json({ success: false, message: "Username already exists"});
    }

    // Create new account in Redis database
    await client.set(`user:${username}`, password);
    console.log(`New user created with username=${username} and password=${password} in Redis database`)
    res.json({ success: true, message: "Registration successful. Redirecting to login..."})

});


// Profile endpoint
app.get('/profile', requireLogin, (req, res) => {
    console.log('Session: ', req.session);
    // Send welcome message when user logs in
    res.json({ success: true, message: `Welcome, ${req.session.user}`});

});


// Log out endpoint
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        // If error
        if (err) {
            console.log('Log out failed');
            return res.json({ status: false, message: "Log out failed"});
        }
        res.clearCookie('connect.sid');
        console.log('Log out successful');
        return res.json({ success: true, message: "Log out successful"});
    })
});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('Running on PORT 5000');
});