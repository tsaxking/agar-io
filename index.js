const express = { Router } = require("express");
const path = require("path");
const router = new Router();
// Getting Classes from other JS files
const { Bot, Player, PolarCoordinatedObject } = require("./server-functions-and-classes/bot.js");
const { Pellet } = require("./server-functions-and-classes/pellet.js");
const tickrate = 60; // How many times per second this runs the interval that moves players and checks collision
const sendrate = 10; // How many times per second the server sends info to the client


const tick = 8; // ms

// client simulate every tick
// client simulate every info from server
// server simulate every request
// send info from client to server every 128 ticks
// send info from server to client every 128 ticks

/*
    Server:
        {
            nearbyPlayers: { // every 128 ticks
                <id>: [x, y, velocity],
                <id>: [x, y, velocity],
                <id>: [x, y, velocity]
            },
            allPlayers: { // every 512 ticks
                <id>: [x, y, velocity],
                <id>: [x, y, velocity],
                <id>: [x, y, velocity]
            },
            pellets: { // every 128 ticks
                new: {
                    <id>: [x, y, color],
                    <id>: [x, y, color],
                    <id>: [x, y, color],
                    <id>: [x, y, color]
                },
                remove: [
                    <id>
                ]
            }
        }

    Client:
        {
            path: [
                angle, // every 8 ticks
            ],
            velocity: [dx, dy], // (arctan(dx/dy))
            position: [x, y],
            interactions: {
                pellets: [
                    <id>
                ],
                players: [
                    <id>
                ]
            }
        }
*/

const initialize = (io) => {
    // Map Size determines how wide the map is relative to a client's screen, so if mapsize = 1 then the map would be the size of each client's screen
    const mapSize = 5;
    // Player count is used to generate IDs for players so that clients can tell which player is them
    let playerCount = 0;

    // Function for creating new players
    const defaultPlayer = (username) => {
        // Changes player count by 1 so that the new player's id is different then the previous player
        playerCount++;
        // See player.js for info on the parameters
        return new Player(
            Math.random() * mapSize,
            Math.random() * mapSize,
            0.02,
            playerCount, {
                r: randomColor(),
                g: randomColor(),
                b: randomColor(),
                alpha: 0.75
            },
            tickrate,
            username
        );
    };

    // Generates a random number between 0 and 256
    const randomColor = () => Math.floor(Math.random() * 256);

    // Creates a new pellet
    const createPellet = () => {
        const x = Math.random() * mapSize;
        const y = Math.random() * mapSize;
        // Took the formula for rainbow coloring from this graph: https://www.desmos.com/calculator/xfg4dalr80;
        const i = /*(*/ (x + y) / (2 * mapSize) // + Date.now()/1000) % 1;
        const r = 3060 * (i - 0.5) ** 2 - 85;
        const g = -3060 * (i - 1 / 3) ** 2 + 340;
        const b = -4950 * (i - 0.58 - 1 / 300) ** 2 + 286.875;

        return new Pellet(x, y, `rgb(${r}, ${g}, ${b})`);
    };

    // Creates a new bot
    const createBot = () => {
        const x = Math.random() * mapSize;
        const y = Math.random() * mapSize;
        // Took the formula for rainbow coloring from this graph: https://www.desmos.com/calculator/xfg4dalr80;
        const i = /*(*/ (x + y) / (2 * mapSize) // + Date.now()/1000) % 1;
        const r = 3060 * (i - 0.5) ** 2 - 85;
        const g = -3060 * (i - 1 / 3) ** 2 + 340;
        const b = -4950 * (i - 0.58 - 1 / 300) ** 2 + 286.875;

        return new Bot(x, y, 0.02, { r, g, b, alpha: 0.25 }, tickrate, "Bot");
    };

    // Objects that store each player and socket in the form of "<socket id>" : "<player/socket>"
    const players = {};
    const sockets = {};
    const usernames = {};

    // Creating an array of pellets and bots based off the map size
    let pellets = Array(30 * mapSize ** 2).fill().map(createPellet);
    let bots = Array(mapSize ** 2).fill().map(createBot);


    io.on("connect", (socket) => {
        console.log('New user has connected:', socket.id);
        
        socket.emit("mapSize", mapSize);

        // Angles is the angle of their mouse relative to the center of their screen
        socket.on("playerUpdate", ({ angle }) => { // send every 1000ms => { path, velocity, position, interactions: { pellets, players } }
            // Gets the exiting player data from an object stored on the server
            let player = players[socket.id];

            // Checks if no data exists
            if (!player) {
                // If there isn't any data it creates new data
                players[socket.id] = defaultPlayer(usernames[socket.id]);
                sockets[socket.id] = socket;

                // Sends the id of the user in order to make it so the user can tell which player is them
                socket.emit("id", playerCount);

                player = players[socket.id];
            }

            // Setting the player's velocity based of the angle given above
            const cartesian = Player.cartesian(angle, player.speed);
            player.velocity.x = cartesian.x;
            player.velocity.y = cartesian.y;

            // if (Mouse.polar(player.velocity.x, player.velocity.y).magnitude < player.speed) {
            //     if (pressedKeys["a"]) {
            //         player.velocity.x -= 0.001;
            //     }
            //     if (pressedKeys["d"]) {
            //         player.velocity.x += 0.001;
            //     }
            //     if (pressedKeys["w"]) {
            //         player.velocity.y -= 0.001;
            //     }
            //     if (pressedKeys["s"]) {
            //         player.velocity.y += 0.001;
            //     }
            //     // They key for space is just " "
            //     if (pressedKeys[" "]) {
            //         player.split();
            //     }
            // } 
        });

        socket.on("usernameChange", ({ username }) => {
            if (!Object.values(usernames).includes(username)) {
                usernames[socket.id] = username;
                socket.emit("usernameChangeResult", true);
            } else {
                socket.emit("usernameChangeResult", false);
            }
            
        });

        // Triggers when a user leaves the page or reloads
        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
            delete players[socket.id];
            delete sockets[socket.id];
            delete usernames[socket.id];

            io.emit("playerUpdate", Object.values(players));
        });
    });

    const interval = setInterval(() => {
        bots.forEach(bot => {
            // Causes the bot to change its velocity in order to move in the direction of a player or pellet
            bot.pathFind(pellets, Object.values(players));

            // Moves the bot
            bot.x += bot.velocity.x;
            bot.y += bot.velocity.y;

            // Making sure the robot doesn't leave the map in case its pathfinding breaks
            ["x", "y"].forEach((coordinate) => {
                if (bot[coordinate] - bot.radius < 0) {
                    // This teleports the bot back within the bounds
                    bot[coordinate] = bot.radius;
                } else if (bot[coordinate] + bot.radius > mapSize) {
                    // This teleports the bot back within the bounds
                    bot[coordinate] = mapSize - bot.radius;
                }
            });

            // Checks if the bot can eat other bots or be eaten by other bots
            bots.forEach(collidingBot => {
                // Pythagorean theorem
                const distance = Math.sqrt((bot.x - collidingBot.x) ** 2 + (bot.y - collidingBot.y) ** 2);

                if (distance <= collidingBot.radius + bot.radius) {
                    // Figuring out which bot is bigger
                    let [largerBot, smallerBot] = [undefined, undefined];
                    if (collidingBot.radius > bot.radius) {
                        largerBot = collidingBot;
                        smallerBot = bot;
                    } else if (collidingBot.radius < bot.radius) {
                        largerBot = bot;
                        smallerBot = collidingBot;
                    }

                    // Checking if their is a larger and smaller bot in case they are the same size.
                    if (largerBot && smallerBot) {
                        // causing the large bot to eat the smaller bot
                        if (largerBot.radius < 0.25) largerBot.radius += 0.0001;
                        smallerBot.radius -= 0.001;
                    }
                }
            });

            // Checks if the bot is eating any pellets
            pellets.forEach(pellet => {
                // Pythagorean theorem
                const distance = Math.sqrt((bot.x - pellet.x) ** 2 + (bot.y - pellet.y) ** 2);
                if (distance <= pellet.radius + bot.radius) {
                    // causing the bot to eat the pellet
                    if (bot.radius < 0.25) bot.radius += 0.00001;
                    pellet.radius -= 0.001;
                }
            });
        });

        Object.values(players).forEach(player => {
            // Moves the player based of their velocity
            player.x += player.velocity.x;
            player.y += player.velocity.y;
            // player.velocity.x -= Math.sign(player.velocity.x) * 0.0015;
            // player.velocity.y -= Math.sign(player.velocity.y) * 0.0015;
            // if (Math.abs(player.velocity.x) < 0.001) {
            //     player.velocity.x = 0;
            // }
            // if (Math.abs(player.velocity.y) < 0.001) {
            //     player.velocity.y = 0;
            // }

            // Checks if the player is outside the bounds of the map
            ["x", "y"].forEach((coordinate) => {
                if (player[coordinate] - player.radius < 0) {
                    // This teleports the player back within the bounds
                    player[coordinate] = player.radius;
                } else if (player[coordinate] + player.radius > mapSize) {
                    // This teleports the player back within the bounds
                    player[coordinate] = mapSize - player.radius;
                }
            });

            // Checking if two players are colliding
            Object.values(players).concat(bots).forEach(collidingPlayer => {
                // Pythagorean theorem
                const distance = Math.sqrt((player.x - collidingPlayer.x) ** 2 + (player.y - collidingPlayer.y) ** 2);
                if (distance <= collidingPlayer.radius + player.radius) {
                    // Figuring out which player or bot is bigger
                    let [largerPlayer, smallerPlayer] = [undefined, undefined];
                    if (collidingPlayer.radius > player.radius) {
                        largerPlayer = collidingPlayer;
                        smallerPlayer = player;
                    } else if (collidingPlayer.radius < player.radius) {
                        largerPlayer = player;
                        smallerPlayer = collidingPlayer;
                    }
                    // Checking if their is a larger and smaller player in case they are the same size.
                    if (largerPlayer && smallerPlayer) {
                        if (largerPlayer.radius < 0.5) largerPlayer.radius += 0.001;
                        smallerPlayer.radius -= 0.001;
                    }
                }
            });

            // Eating pellets
            pellets.forEach(pellet => {
                // Pythagorean theorem
                const distance = Math.sqrt((player.x - pellet.x) ** 2 + (player.y - pellet.y) ** 2);
                if (distance <= pellet.radius + player.radius) {
                    // The if statement here is smaller than it is for eating player which prevents you from gaining size from pellets once you have hit a certain size
                    if (player.radius < 0.25) player.radius += 0.0003;
                    pellet.radius -= 0.003;
                }
            });

            // removing any pellets or bots that have been eaten
            pellets = pellets.filter(p => p.radius > 0);
            bots = bots.filter(b => b.radius > 0);

            // Filling the pellets and bots to their original size.
            if (pellets.length < 20 * mapSize ** 2) pellets = [...Array(30 * mapSize ** 2 - pellets.length).fill().map(createPellet), ...pellets];
            if (bots.length < mapSize ** 2) bots = [...Array(mapSize ** 2 - bots.length).fill().map(createBot), ...bots];
        });

        // Detecting if a player has died because they have a radius of 0 or less.
        Object.values(players).forEach((player, index) => {
            if (player.radius <= 0) {
                // This triggers a listener
                sockets[Object.keys(players)[index]].emit("playerDied", undefined);

                delete players[Object.keys(players)[index]];
            }
        });
    }, 1000 / tickrate);

    const sendInterval = setInterval(() => {
        // Sending the client the array of pellets so the client can draw them
        io.emit("pelletsUpdate", pellets);
        // Sending the client a list of bots and players.
        // I am able to send them both because the Bot class is an extension of the Player class so any methods or properties of the Player class that the client need will also be methods or properties of the Bot class
        io.emit("playersUpdate", Object.values(players).concat(bots).map(player => {
            // Minimal info just simplifies the player object to only contain visual info and the player's id in order to have cyber security and to not send too much data
            return player.minimalInfo;
        }));
    }, 1000 / sendrate);
}

router.use("/*", (req, res, next) => {
    console.log(req.url);
    next();
});

// Sending all the javascript and css files to the client
router.use("/static", express.static(path.resolve(__dirname, "./static")));

// Sending the index.html file to the client
router.get("/*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "./templates/index.html"));
});

module.exports = { agarRouter: router, initialize };