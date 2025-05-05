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
        // local host for now, maybe VM IP later
        host: '34.173.23.63',
        port: 6379
    },
    password: '5Xr9!fH2s@Dp7t$kQb8yP0zLwE#Vg3zR'
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


// GAME ENDPOINTS

// Enter queue endpoint
app.post('/enterqueue', async (req, res) => {
    // Retrieve current global lobby ID counter from Redis
    let queueId = await client.get('queue:counter');
    let queueIsOpen = await client.get('queue:isOpen');

    // Global queue ID doesn't exist
    if (!queueId) {
        // Setting new queue:counter to 1000
        console.log("Setting new queue:counter to 1000 in Redis");
        await client.set('queue:counter', 1000);
        queueId = await client.get('queue:counter');
    }
    // Global queue:isOpen doesn't exist
    else if (!queueIsOpen) {
        console.log("Setting new queueIsOpen to 0 in Redis");
        await client.set('queue:isOpen', 0);
        queueIsOpen = await client.get('queue:isOpen');
    }

    const queue = `queue:${queueId}`

    if (queueIsOpen == 1) {
        // Enter queue
        await client.zAdd(queue, [{score: 0, value: req.session.user}]);

        // Get new queue size
        const queueSize = await client.zCard(queue);
        // Get number of players ready
        const readySize = await client.zCount(queue, 1, 1);
        return res.json({ success: true, queueId: queueId, queueSize: queueSize, readySize: readySize});

    }
    else {
        // Open queue and enter it
        await client.set('queue:isOpen', 1);
        await client.zAdd(queue, [{score: 0, value: req.session.user}]);

        // Get new queue size
        const queueSize = await client.zCard(queue);
        // Get number of players ready
        const readySize = await client.zCount(queue, 1, 1);
        return res.json({ success: true, queueId: queueId, queueSize: queueSize, readySize: readySize});

    }

});

// Ready up endpoint
app.post('/readyup', async (req, res) => {
    // Get queueId from request
    const { queueId } = req.body;

    const user = req.session.user;
    const queue = `queue:${queueId}`;

    // Set score to 1 in queue (means user is ready)
    await client.zAdd(queue, [{score: 1, value: user}]);
    
    // Get number of ready players and size of queue
    const readySize = await client.zCount(queue, 1, 1);
    const queueSize = await client.zCard(queue);

    // If this player is the last player to ready up
    if (readySize == queueSize) {
        // Set player last ready
        await client.set(`queue:${queueId}:lastReady`, user);
        return res.json({ success: true, queueSize: queueSize, readySize: readySize, lastReady: true});
    }
    else {
        return res.json({ success: true, queueSize: queueSize, readySize: readySize, lastReady: false});
    }

    

})


// Queue status endpoint
app.post('/queuestatus', async (req, res) => {
    // Get queueId from request
    const { queueId } = req.body;
    const queue = `queue:${queueId}`;

    // Query queue size and ready size from 
    const queueSize = await client.zCard(queue);
    const readySize = await client.zCount(queue, 1, 1);

    console.log("Updating queue status...");
    return res.json({ success: true, queueSize: queueSize, readySize: readySize});

})


// Last ready endpoint (to check which player starts the game)
app.get('/lastready', async (req, res) => {
    const queueId = await client.get("queue:counter");

    const userLastReady = await client.get(`queue:${queueId}:lastready`);

    // Game ID is set to current Queue ID
    return res.json({ success: true, lastReady: userLastReady, gameId: queueId});
})


// User endpoint (get user)
app.get('/user', (req, res) => {
    const user = req.session.user;
    return res.json({ success:true, user: user});
})


// Start game endpoint (only for last player to ready up)
app.post('/startgame', async (req, res) => {
    const { gameId, wordList } = req.body;

    // Close the queue
    await client.set("queue:isOpen", 0);
    await client.incr("queue:counter");

    // Set game ID counter in Redis databse
    await client.set("game:counter", gameId);

    // Get all players from queue
    const players = await client.zRange(`queue:${gameId}`, 0, -1);
    // Add each player to a new game in Redis database
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        // Push player to list of players
        await client.lPush(`game:${gameId}`, player);
        // Push player to sorted set for player HPs
        await client.zAdd(`game:${gameId}:hps`, [{score: 0, value: req.session.user}]);
        // Create sorted set for player word count
        await client.zAdd(`game:${gameId}:wordCounts`, [{score: 0, value: req.session.user}]);
        
    }
    // Create word list
    console.log(wordList);
    for (let i = 0; i < wordList.length; i++ ) {
        await client.rPush(`game:${gameId}:wordList`, wordList[i]);
    }
    

    // Set game:gameId:ready to 1 after creating game, for other users to join game
    await client.set(`game:${gameId}:ready`, 1);
    return res.json({success: true});

})

// Update game endpoint (each user uses this to update their status in game)
app.post('/updategame', async (req, res) => {
    // Only leading player will add zone words and new words
    const { hp, wordCount, newWords, newZoneWords } = req.body;
    const { gameId } = req.body;
    const user = req.session.user;

    // Update HP in Redis database
    await client.zAdd(`game:${gameId}:hps`, [{score: hp, value: user}])
    // Update wordcount in Redis database
    await client.zAdd(`game:${gameId}:wordCounts`, [{score: wordCount, value: user}])
    // Update wordList in Redis database
    for (let i = 0; i < newWords.length; i++ ) {
        await client.rPush(`game:${gameId}:wordList`, newWords[i]);
    }
    // Update zoneList in Redis database
    for (let i = 0; i < newZoneWords.length; i++ ) {
        await client.rPush(`game:${gameId}:zoneList`, newZoneWords[i]);
    }
    // If player's HP is 0, add them to the list of eliminated players
    if (hp == 0) {
        await client.rPush(`game:${gameId}:eliminated`, user);
    }


})

// Fetch game endpoint (each user uses this to update their display of other users' status)
app.post('/fetchgame', async (req, res) => {
    const { gameId } = req.body;

    // Get player HPs with scores (descending order)
    const playerHps = await client.zRange(`game:${gameId}:hps`, 0, -1, {WITHSCORES: true});
    // Get player word counts with scores (descending order)
    const playerWordCounts = await client.zRange(`game:${gameId}:wordCounts`, 0, -1, {WITHSCORES: true});
    // Get word list
    const wordList = await client.lRange(`game:${gameId}:wordList`, 0, -1);
    // Get zone list (default is empty if no zonelist is found)
    const zoneList = await client.lRange(`game:${gameId}:zoneList`, 0, -1);

    //console.log("word list:" + wordList)
    return res.json({ success: true, playerHps: playerHps, playerWordCounts: playerWordCounts, 
        wordList: wordList, zoneList: zoneList});

})


app.post('/checkgameready', async (req, res) => {
    const { gameId } = req.body;

    // Check if this gameId is ready
    const gameReady = await client.get(`game:${gameId}:ready`);
    if (gameReady) {
        return res.json({ success: true, gameReady: true});
    }
    else {
        return res.json({ success: true, gameReady: false});
    }
})


// Join game endpoint (for all other players than last player to ready up)
app.post('/joingame', async (req, res) => {

});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('Running on PORT 5000');
});