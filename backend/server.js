// Backend

// Imports
const redis = require('redis');
const ioredis = require('ioredis');
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

const r = new ioredis({
    host: '34.173.23.63',
    port: 6379,
    password: '5Xr9!fH2s@Dp7t$kQb8yP0zLwE#Vg3zR'
});

const wordBank = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon', 'apricot', 'blueberry', 'cantaloupe', 'dragonfruit', 'eggplant', 'fennel', 'guava', 'hibiscus', 'iceberg', 'jalapeno', 'kumquat', 'lime', 'mulberry', 'nectarine', 'olive', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'rhubarb', 'starfruit', 'tomato', 'unique', 'yam', 'zucchini', 'acorn', 'bagel', 'cat', 'dog', 'elephant', 'frog', 'giraffe', 'horse', 'iguana', 'jellyfish', 'kangaroo', 'lion', 'monkey', 'narwhal', 'octopus', 'parrot', 'quail', 'rabbit', 'snake', 'tiger', 'umbrella', 'vulture', 'walrus', 'xylophone', 'yak', 'zebra', 'antelope', 'bear', 'cow', 'dolphin', 'eagle', 'fox', 'gorilla', 'hippopotamus', 'iguana', 'jaguar', 'koala', 'lemur', 'moose', 'newt', 'opossum', 'penguin', 'quokka', 'raccoon', 'sloth', 'toucan', 'unicorn', 'viper', 'whale', 'xerus', 'yellowjacket', 'zebra', 'albatross', 'baboon', 'cactus', 'dingo', 'elk', 'fern', 'gecko', 'hawk', 'owl', 'penguin', 'quail', 'rooster', 'sparrow', 'toucan', 'vulture', 'warbler', 'xenops', 'yodeler', 'zebra', 'artichoke', 'blueberry', 'cabbage', 'daffodil', 'eucalyptus', 'fern', 'ginseng', 'hibiscus', 'ivy', 'juniper', 'kelp', 'lavender', 'marigold', 'nasturtium', 'oregano', 'petunia', 'quinoa', 'rosemary', 'sage', 'thyme', 'violet', 'wisteria', 'xenia', 'yucca', 'zinnia', 'acorn', 'ball', 'clock', 'door', 'elephant', 'flag', 'grape', 'hat', 'ink', 'jug', 'kite', 'lemon', 'mask', 'nut', 'octagon', 'park', 'queen', 'radio', 'ship', 'train', 'umbrella', 'vest', 'wagon', 'xylophone', 'yellow', 'zebra', 'axis', 'break', 'crane', 'drum', 'end', 'flare', 'gap', 'hunt', 'icon', 'joke', 'key', 'love', 'mark', 'neck', 'oval', 'park', 'quiz', 'rest', 'snap', 'tale', 'unit', 'void', 'wall', 'yoke', 'zest', 'arm', 'bend', 'cash', 'die', 'ear', 'fit', 'gun', 'ham', 'ink', 'joy', 'kit', 'lad', 'man', 'net', 'oil', 'pen', 'rat', 'sun', 'toy', 'urn', 'vat', 'win', 'yak', 'zip', 'aim', 'ball', 'coat', 'dust', 'egg', 'fan', 'grid', 'horn', 'ink', 'jam', 'log', 'mix', 'nap', 'odd', 'pit', 'rug', 'saw', 'tin', 'undo', 'vet', 'wig', 'you', 'zip', 'amber', 'bench', 'coat', 'deck', 'epic', 'fame', 'gear', 'hand', 'ice', 'jam', 'king', 'log', 'map', 'net', 'oak', 'pet', 'quiz', 'rug', 'sap', 'top', 'urn', 'van', 'web', 'yam', 'zoo', 'angle', 'bar', 'cast', 'deal', 'eel', 'flat', 'gash', 'heat', 'icon', 'jolt', 'king', 'lace', 'mile', 'net', 'oak', 'pit', 'queen', 'rag', 'sat', 'tin', 'urn', 'vet', 'win', 'yet', 'zone', 'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray', 'yankee', 'zulu',
  ];

async function initializeWordBank() {
const exists = await client.exists('wordBank');
if (!exists) {
    console.log('Initializing word bank in Redis...');
    // Add all words to a Redis set
    await client.sAdd('wordBank', wordBank);
    console.log(`Word bank initialized with ${wordBank.length} words`);
}
}

// Connect to Redis
client.connect()
    .then(async () => {
        console.log('Connected to Redis');
        await initializeWordBank();
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
    const { username, password, displayName, email } = req.body;

    // Check for any blank fields
    if (!username) {
        console.log("Missing username");
        return res.json({ success: false, message: "Missing username"});
    }
    else if (!password) {
        console.log("Missing password");
        return res.json({ success: false, message: "Missing password"});
    }
    else if (!displayName) {
        console.log("Missing display name");
        return res.json({ success: false, message: "Missing display name"});
    }
    else if (!email) {
        console.log("Missing email");
        return res.json({ success: false, message: "Missing email"});
    }

    // Check if username already exists in Redis database
    const existingUser = await client.get(`user:${username}`);
    if (existingUser) {
        console.log(`Username ${username} already exists in Redis database`);
        return res.json({ success: false, message: "Username already exists"});
    }

    // Check if email already exists in Redis database
    const existingEmail = await client.get(`email:${email}`);
    if (existingEmail) {
        console.log(`Email ${email} already registered in Redis database`);
        return res.json({ success: false, message: "Email already registered"});
    }

    // Create new account in Redis database
    await client.set(`user:${username}`, password);
    await client.set(`user:${username}:displayName`, displayName);
    await client.set(`user:${username}:email`, email);
    await client.set(`email:${email}`, username); // For email uniqueness check
    
    console.log(`New user created with username=${username}, displayName=${displayName}, email=${email} in Redis database`)
    res.json({ success: true, message: "Registration successful. Redirecting to login..."})
});


// Profile endpoint
app.get('/profile', requireLogin, (req, res) => {
    console.log('Session: ', req.session);
    // Send welcome message when user logs in
    res.json({ success: true, message: `Welcome, ${req.session.user}`});

});

// Get user profile endpoint
app.get('/userprofile', requireLogin, async (req, res) => {
    const username = req.session.user;
    
    try {
        // Get user information from Redis
        const displayName = await client.get(`user:${username}:displayName`) || username;
        const email = await client.get(`user:${username}:email`) || '';
        
        return res.json({ 
            success: true, 
            username: username,
            displayName: displayName,
            email: email
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.json({ success: false, message: "Error fetching user profile" });
    }
});

// Update display name endpoint
app.post('/updatedisplayname', requireLogin, async (req, res) => {
    const username = req.session.user;
    const { displayName } = req.body;
    
    if (!displayName) {
        return res.json({ success: false, message: "Display name cannot be empty" });
    }
    
    try {
        await client.set(`user:${username}:displayName`, displayName);
        console.log(`Updated display name for ${username} to ${displayName}`);
        return res.json({ success: true, message: "Display name updated successfully" });
    } catch (error) {
        console.error('Error updating display name:', error);
        return res.json({ success: false, message: "Error updating display name" });
    }
});

// Update email endpoint
app.post('/updateemail', requireLogin, async (req, res) => {
    const username = req.session.user;
    const { email } = req.body;
    
    if (!email) {
        return res.json({ success: false, message: "Email cannot be empty" });
    }
    
    try {
        // Check if new email is already registered to another user
        const existingEmail = await client.get(`email:${email}`);
        if (existingEmail && existingEmail !== username) {
            return res.json({ success: false, message: "Email already registered to another account" });
        }
        
        // Get old email to remove from Redis
        const oldEmail = await client.get(`user:${username}:email`);
        if (oldEmail) {
            await client.del(`email:${oldEmail}`);
        }
        
        // Set new email
        await client.set(`user:${username}:email`, email);
        await client.set(`email:${email}`, username);
        
        console.log(`Updated email for ${username} to ${email}`);
        return res.json({ success: true, message: "Email updated successfully" });
    } catch (error) {
        console.error('Error updating email:', error);
        return res.json({ success: false, message: "Error updating email" });
    }
});

// Update password endpoint
app.post('/updatepassword', requireLogin, async (req, res) => {
    const username = req.session.user;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.json({ success: false, message: "Current and new password are required" });
    }
    
    try {
        // Verify current password
        const storedPassword = await client.get(`user:${username}`);
        if (storedPassword !== currentPassword) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }
        
        // Update password
        await client.set(`user:${username}`, newPassword);
        console.log(`Updated password for ${username}`);
        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.json({ success: false, message: "Error updating password" });
    }
});

// Update all profile fields endpoint
app.post('/updateprofile', requireLogin, async (req, res) => {
    const username = req.session.user;
    const { displayName, email, currentPassword, newPassword } = req.body;
    
    try {
        // Update display name if provided
        if (displayName) {
            await client.set(`user:${username}:displayName`, displayName);
        }
        
        // Update email if provided
        if (email) {
            const oldEmail = await client.get(`user:${username}:email`);
            
            // Check if new email is different from current one
            if (oldEmail !== email) {
                // Check if new email is already registered to another user
                const existingEmail = await client.get(`email:${email}`);
                if (existingEmail && existingEmail !== username) {
                    return res.json({ success: false, message: "Email already registered to another account" });
                }
                
                // Remove old email mapping
                if (oldEmail) {
                    await client.del(`email:${oldEmail}`);
                }
                
                // Set new email
                await client.set(`user:${username}:email`, email);
                await client.set(`email:${email}`, username);
            }
        }
        
        // Update password if both current and new are provided
        if (currentPassword && newPassword) {
            // Verify current password
            const storedPassword = await client.get(`user:${username}`);
            if (storedPassword !== currentPassword) {
                return res.json({ success: false, message: "Current password is incorrect" });
            }
            
            // Update password
            await client.set(`user:${username}`, newPassword);
        }
        
        console.log(`Updated profile for ${username}`);
        return res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.json({ success: false, message: "Error updating profile" });
    }
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
    const { user } = req.body;

    // Retrieve current global lobby ID counter from Redis
    let queueId = await client.get('queue:counter');

    // Global queue ID doesn't exist
    if (!queueId) {
        // Setting new queue:counter to 1000
        console.log("Setting new queue:counter to 1000 in Redis");
        await client.set('queue:counter', 1000);
        queueId = await client.get('queue:counter');
    }

    // Key for queue
    const queue = `queue:${queueId}`

    // Score 0 means user is not ready
    await client.zAdd(queue, [{score: 0, value: user}]);

    // Get new queue size
    const queueSize = await client.zCard(queue);
    // Get number of players ready (number of players whose score == 1)
    const readySize = await client.zCount(queue, 1, 1);

    // Return queueId, queueSize, readySize
    return res.json({ success: true, queueId: queueId, queueSize: queueSize, readySize: readySize});


});

// Ready up endpoint
app.post('/readyup', async (req, res) => {
    // Get queueId from request
    const { queueId, user } = req.body;

    // Keys for user and queue in Redis database
    const queue = `queue:${queueId}`;

    // Set existing score to 1 in queue (means user is ready)
    await client.zAdd(queue, [{score: 1, value: user}]);
    
    // Get number of ready players and size of queue
    const readySize = await client.zCount(queue, 1, 1);
    const queueSize = await client.zCard(queue);

    // If this player is the last player to ready up
    if (readySize == queueSize) {
        // Set this player as last ready
        await client.set(`queue:${queueId}:lastReady`, user);

        // LOCK THE QUEUE ID to prevent race conditions
        await client.set(`queue:${queueId}:locked`, 1);

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

    // Key for queue in Redis
    const queue = `queue:${queueId}`;

    // Query queue size and ready size from 
    const queueSize = await client.zCard(queue);
    const readySize = await client.zCount(queue, 1, 1);

    console.log("Updating queue status...");
    return res.json({ success: true, queueSize: queueSize, readySize: readySize});

})


// Last ready endpoint (to check which player starts the game)
app.get('/lastready', async (req, res) => {
    // Get current queueId
    const queueId = await client.get("queue:counter");

    // Get lastReady from that queueId
    const userLastReady = await client.get(`queue:${queueId}:lastReady`);

    console.log(userLastReady)

    // Game ID is set to current Queue ID
    return res.json({ success: true, lastReady: userLastReady, gameId: queueId});
})


// User endpoint (get user)
app.get('/user', (req, res) => {
    const user = req.session.user;
    return res.json({ success:true, user: user});
})


// Start game endpoint (only for last readied player)
app.post('/startgame', async (req, res) => {
    // Get gameId and wordList from last readied player
    const { gameId, user } = req.body;

    // IMPORTANT: Check if this user is actually the last one who readied up
    const lastReadyUser = await client.get(`queue:${gameId}:lastReady`);
    if (user !== lastReadyUser) {
        console.log(`User ${user} is not the last ready user (${lastReadyUser}), rejecting game creation`);
        return res.json({ success: false, message: "Unauthorized - you are not the last ready user" });
    }

    // CHECK IF GAME ALREADY EXISTS to prevent duplicate creation
    const gameExists = await client.exists(`game:${gameId}:wordList`);
    if (gameExists) {
        console.log(`Game ${gameId} already exists, skipping creation.`);
        return res.json({ success: true });
    }

    console.log(`Authorized user ${user} creating game ${gameId}`);

    // Set game:<gameId>:ready to 1 after creating game, for other users to join game
    await client.set(`game:${gameId}:ready`, 1);

    // Get all players from queue
    const players = await client.zRange(`queue:${gameId}`, 0, -1);

    // Add each player to a new game in Redis database
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        // Push player to list of players
        await client.lPush(`game:${gameId}`, player);
        // Push player to sorted set for player HPs (starting HP is 5)
        await client.zAdd(`game:${gameId}:hps`, [{score: 5, value: player}]);
        // Create sorted set for player word count (starting wordCount is 0)
        await client.zAdd(`game:${gameId}:wordLines`, [{score: 0, value: player}]);
        
    }
    // Create word list
    // Generate initial 10 words from the word bank
    const initialWords = await client.sRandMember('wordBank', 10);
    
    // Add words to the game's word list
    await client.rPush(`game:${gameId}:wordList`, ...initialWords);

    console.log(`Creating game ${gameId} with ${players.length} players`);
    console.log(`Adding ${initialWords.length} words to game ${gameId}`);

    // Set zoneIndex to 0
    await client.set(`game:${gameId}:zoneIndex`, -2);

    await client.del(`queue:${gameId}:locked`);

    // Increment queue:counter
    await client.incr("queue:counter");

    console.log(`Game ${gameId} created successfully, queue counter incremented`);
    
    return res.json({success: true});

})

// Gets words for specific line
app.post('/getWordLine', async (req, res) => {
    const { gameId, lineIndex } = req.body;
    
    if (!gameId || lineIndex === undefined) {
      return res.json({ success: false, message: "Missing gameId or lineIndex" });
    }
    
    try {
      // Calculate start and end indices (10 words per line)
      const startIndex = lineIndex * 10;
      const endIndex = startIndex + 9;

      // Use a Lua script to atomically check words and add if needed
      const luaScript = `
        local gameKey = KEYS[1]
        local startIndex = tonumber(ARGV[1])
        local endIndex = tonumber(ARGV[2])
        
        -- Get existing words for this line
        local words = redis.call('LRANGE', gameKey, startIndex, endIndex)
        
        -- If we have 10 words already, just return them
        if #words == 10 then
        return words
        end
        
        -- Calculate how many words we need
        local wordsMissing = 10 - #words
        
        -- Only generate words if we need more and aren't at the end yet
        if wordsMissing > 0 then
        -- Generate new words using SRANDMEMBER
        local newWords = redis.call('SRANDMEMBER', 'wordBank', wordsMissing)
        
        -- Add new words to the game's word list
        for i, word in ipairs(newWords) do
            redis.call('RPUSH', gameKey, word)
        end
        
        -- Append new words to our result
        for i, word in ipairs(newWords) do
            table.insert(words, word)
        end
        end
        
        return words
      `
      
      // Execute the Lua script
      const words = await r.eval(
            luaScript,
            1,                         // Number of keys
            `game:${gameId}:wordList`, // Key #1
            startIndex,                // ARGV[1]
            endIndex                   // ARGV[2]
        );
      
      return res.json({ success: true, words: words });
    } catch (error) {
      console.error('Error getting word line:', error);
      return res.json({ success: false, message: "Error getting words" });
    }
  });

// Check game ready (for all players other than last readied player)
app.post('/checkgameready', async (req, res) => {
    const { gameId } = req.body;

    // Check if this gameId is ready
    const gameReady = await client.get(`game:${gameId}:ready`);
    // 1 for ready, 0 for not ready
    if (gameReady === '1') {
        return res.json({ success: true, gameReady: true});
    }
    else {
        return res.json({ success: true, gameReady: false});
    }
})

// Add to server.js
app.post('/lockqueueid', async (req, res) => {
    const { queueId } = req.body;
    
    // Set a lock flag to prevent ID conflicts during game creation
    await client.set(`queue:${queueId}:locked`, 1);
    
    return res.json({ success: true });
});

app.get('/getgameid', async (req, res) => {
    // Get current queueId
    const queueId = await client.get("queue:counter");
    
    // Check if previous queue is locked (game creation in progress)
    const prevQueueId = (parseInt(queueId) - 1).toString();
    const isLocked = await client.get(`queue:${prevQueueId}:locked`);
    
    // If previous queue is locked, use that ID instead
    if (isLocked === '1') {
        return res.json({ success: true, gameId: prevQueueId });
    }
    
    // Otherwise, use actual game ID (one less than current queue ID)
    const gameId = parseInt(queueId) - 1;
    return res.json({ success: true, gameId: gameId.toString() });
});

app.post('/updategame', async (req, res) => {
    const { gameId, hp, currentLineIndex, user } = req.body;

    let playerHp = hp;

    const lineIndexNumber = parseInt(currentLineIndex) || 0;

    // Set new currentLineIndex for this player, in case it's updated
    await client.zAdd(`game:${gameId}:wordLines`, [{score: lineIndexNumber, value: user}]);

    // Check if player is in zone
    const lineIndex = await client.zScore(`game:${gameId}:wordLines`, user);
    const zoneIndex = await client.get(`game:${gameId}:zoneIndex`);
    if (lineIndex <= zoneIndex) {
        // Subtract from user HP
        const newHp = hp - 1;
        await client.zAdd(`game:${gameId}:hps`, [{score: newHp, value: user}]);
        playerHp = await client.zScore(`game:${gameId}:hps`, user);
        console.log(playerHp)

        // If player died (HP is 0)
        if (newHp == 0) {
            // Add a kill to leader
            const leader = await client.get(`game:${gameId}:leader`);
            const kills = await client.get(`game:${gameId}:${leader}:kills`);
            if (kills == null) {
                await client.set(`game:${gameId}:${leader}:kills`, 1);
            }
            else {
                await client.incr(`game:${gameId}:${leader}:kills`);
            }
        }
    }

    return res.json({ success: true, playerHp: playerHp });

})

// Fetch game endpoint (each user uses this to update their display of other users' status)
app.post('/fetchgame', async (req, res) => {
    const { gameId, user } = req.body;
    
    // Get all player line indices
    const allPlayers = await client.zRange(`game:${gameId}:wordLines`, 0, -1, { WITHSCORES: true });
    const playerWordLines = {};

    // Convert the flattened array into a proper object
    for (let i = 0; i < allPlayers.length; i += 2) {
        const player = allPlayers[i];
        const score = parseInt(allPlayers[i + 1]) || 0;
        playerWordLines[player] = score;
    }

    
    // Get all player HP values
    const allPlayerHps = await client.zRange(`game:${gameId}:hps`, 0, -1, { WITHSCORES: true });
    const playerHps = {};

    // Convert the flattened array into a proper object
    for (let i = 0; i < allPlayerHps.length; i += 2) {
        const player = allPlayerHps[i];
        const health = parseInt(allPlayerHps[i + 1]) || 0;
        playerHps[player] = health;
    }
    
    const leader = await r.zrevrange(`game:${gameId}:wordLines`, 0, 0);
    const isLeader = leader[0] === user;

    // Get word list
    const wordList = await client.lRange(`game:${gameId}:wordList`, 0, -1);
    // Check if user is in zone
    const lineIndex = await client.zScore(`game:${gameId}:wordLines`, user);
    const zoneIndex = await client.get(`game:${gameId}:zoneIndex`);
    let inZone = false;
    if (lineIndex <= zoneIndex) {
        inZone = true;
    }
    // Check if user died (HP = 0)
    let died = false;
    const hp = await client.zScore(`game:${gameId}:hps`, user);
    if (hp == '0') {
        died = true;
    }

    // Check if game should end (only one player alive)
    const alivePlayers = await client.zCount(`game:${gameId}:hps`, 1, '+inf');
    const gameEnded = alivePlayers <= 1;

    if (gameEnded) {
        // Get the winner (last player standing)
        const winner = await r.zrangebyscore(`game:${gameId}:hps`, 1, '+inf', 'LIMIT', 0, 1);
        const isWinner = winner[0] === user;
        
        console.log(`Game ${gameId} has ended. Winner: ${winner[0]}`);
        
        return res.json({ 
            success: true,
            gameOver: true,
            winner: winner[0],
            isWinner: isWinner,
            success: true, playerHps: playerHps, playerWordLines: playerWordLines, 
            wordList: wordList, hp: hp, inZone: inZone, died: died, leader: leader[0], isLeader: isLeader
        });
    }

    //console.log("word list:" + wordList)
    return res.json({ success: true, playerHps: playerHps, playerWordLines: playerWordLines, 
        wordList: wordList, hp: hp, inZone: inZone, died: died, leader: leader[0], isLeader: isLeader });

})

// Updates current leader in game
app.post('/updateleader', async (req, res) => {
    const { gameId, currentLineIndex, leader } = req.body;

    // Add the new words to the game
    try {
        // Use a transaction to make updates atomic
        await r.multi()
        .set(`game:${gameId}:leader`, leader)
        .set(`game:${gameId}:zoneIndex`, currentLineIndex - 2)
        .exec();

        // Generate 10 new random words atomically using Lua script
        const luaScript = `
          local gameKey = KEYS[1]
        
          -- Generate 10 new random words
          local newWords = redis.call('SRANDMEMBER', 'wordBank', 10)
        
          -- Add words to the game's word list
          for i, word in ipairs(newWords) do
          redis.call('RPUSH', gameKey, word)
          end
        
          return #newWords
        `
        const wordCount = await r.eval(
            luaScript,
            1,                         // Number of keys
            `game:${gameId}:wordList`  // Key #1
          );
          
        console.log(`Successfully added ${wordCount} words to game ${gameId}`);
        return res.json({ success: true });
    } catch (error) {
        console.error(`Error adding words to Redis: ${error}`);
        return res.json({ success: false, message: "Error adding words" });
    }
});

// Gets leader kills
app.post('/getleaderkills', async (req, res) => {
    const { gameId, leader } = req.body;
    
    const kills = await client.get(`game:${gameId}:${leader}:kills`) || 0;
    
    return res.json({ success: true, kills: parseInt(kills) });
});

app.post('/leavegame', async (req, res) => {
    const { gameId, user } = req.body;
    console.log("Leaving game - gameId:", gameId, "user:", user);

    try {
        // 1. Remove user from the main players list
        await client.lRem(`game:${gameId}`, 0, user);
        
        // 2. Remove user from HP tracking sorted set
        await client.zRem(`game:${gameId}:hps`, user);
        
        // 3. Remove user from word lines (progress) tracking sorted set
        await client.zRem(`game:${gameId}:wordLines`, user);
        
        // 4. Add a kill to leader (only if there is a leader)
        const leader = await client.get(`game:${gameId}:leader`);
        if (leader) {
            // Make sure to only proceed if leader is a valid string
            if (typeof leader === 'string' && leader.trim() !== '') {
                const killsKey = `game:${gameId}:${leader}:kills`;
                console.log("Using kills key:", killsKey); // Add this log
                try {
                    const kills = await client.get(killsKey);
                    if (kills == null) {
                        await client.set(killsKey, 1);
                    } else {
                        await client.incr(killsKey);
                    }
                } catch (err) {
                    console.error("Redis error with key", killsKey, err);
                    // Continue execution even if this fails
                }
            }
        }
        
        // 5. Check if this was the leader who left
        if (user === leader) {
            // Find new leader (player with highest word line score)
            const players = await r.zrevrange(`game:${gameId}:wordLines`, 0, 0);
            if (players.length > 0) {
                const newLeader = players[0];
                await client.set(`game:${gameId}:leader`, newLeader);
                console.log(`New leader set to ${newLeader} after ${user} left`);
            }
        }
        
        return res.json({ success: true, message: "Successfully left the game" });
    } catch (error) {
        console.error("Error while leaving game:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error("Stack trace:", error.stack);
        return res.json({ success: false, message: "Error leaving game" });
    }
});

// Add this to your server.js file
app.post('/leavequeue', async (req, res) => {
    const { queueId, user } = req.body;
    
    if (!queueId || !user) {
        return res.json({ success: false, message: "Missing queueId or user" });
    }
    
    try {
        // Key for queue in Redis
        const queue = `queue:${queueId}`;
        
        // Remove user from the queue
        const removed = await client.zRem(queue, user);
        
        if (removed) {
            // Get updated queue size and ready size
            const queueSize = await client.zCard(queue);
            const readySize = await client.zCount(queue, 1, 1);
            
            console.log(`User ${user} removed from queue ${queueId}. Remaining: ${queueSize} players, ${readySize} ready`);
            
            // If queue is now empty, clean up queue resources
            if (queueSize === 0) {
                await client.del(queue);
                await client.del(`queue:${queueId}:lastReady`);
                await client.del(`queue:${queueId}:locked`);
                console.log(`Queue ${queueId} deleted as it's now empty`);
            }
            
            return res.json({ 
                success: true, 
                message: "Successfully left queue",
                queueSize: queueSize,
                readySize: readySize
            });
        } else {
            console.log(`User ${user} not found in queue ${queueId}`);
            return res.json({ success: false, message: "User not found in queue" });
        }
    } catch (error) {
        console.error('Error leaving queue:', error);
        return res.json({ success: false, message: "Error leaving queue" });
    }
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Running on PORT 3000');
});