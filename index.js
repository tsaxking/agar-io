const express = { Router } = require("express");
const path = require("path");
const router = new Router();
// Getting Classes from other JS files
const { Bot, Player, PolarCoordinatedObject } = require("./server-functions-and-classes/bot.js");
const { Pellet } = require("./server-functions-and-classes/pellet.js");
const tickrate = 10; // How many times per second this runs the interval that moves players and checks collision
const sendrate = 2; // How many times per second the server sends info to the client


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

        socket.emit("staticInfo", ({ mapSize, baseSpeed: tickrate }));

        // Angles is the angle of their mouse relative to the center of their screen
        socket.on("playerUpdate", ({ path }) => { // send every 1000ms => { path, velocity, position, interactions: { pellets, players } }
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

            if (path && Array.isArray(path) && path.length) player.path = [...player.path, ...path];

            // Setting the player's velocity based of the angle given above
            // const cartesian = Player.cartesian(angle, player.speed);
            // player.velocity.x = cartesian.x;
            // player.velocity.y = cartesian.y;


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

    function Interval(callback, time) {
        this.stopped = false;
        (async() => {
            const sleep = async(ms) => new Promise((res) => setTimeout(res, ms));
            const targetTime = time;
            while (!this.stopped) {
                await sleep(time);
                const start = Date.now();
                callback();
                const end = Date.now();
                time = (targetTime - (end - start));
            }
        })();
        this.stop = () => this.stopped = true;
    }

    const botInterval = new Interval(() => {
        bots.forEach(bot => {
            // Causes the bot to change its velocity in order to move in the direction of a player or pellet
            bot.pathFind(pellets, Object.values(players));

            bot.path.push(PolarCoordinatedObject.polar(bot.velocity.x, bot.velocity.y).angle);
        });

    }, 1000 / tickrate);

    const sendInterval = new Interval(() => {
        if (Object.values(players).length) console.log(Object.values(players)[0].path);
        Object.values(players).concat(bots).forEach(player => {
            // Checking that a player isn't cheating by moving more times then they are supposed to
            if (player.path.length > 10) player.path = player.path.slice(player.path.length - 10);
            player.potentialColliders = [];

            pellets.forEach(pellet => {
                if (findDistance(pellet, player) < player.speed * tickrate / sendrate + player.radius + pellet.radius) player.potentialColliders.push(pellet);
            });

            Object.values(players).concat(bots).forEach(collidingPlayer => {
                if (findDistance(collidingPlayer, player) < player.speed * tickrate / sendrate + collidingPlayer.speed * tickrate / sendrate + player.radius + collidingPlayer.radius) player.potentialColliders.push(collidingPlayer);
            });
        });

        // Slightly faster for loop
        new Array(10).fill().forEach((_, i) => {
            Object.values(players).concat(bots).forEach(player => {
                if (!player.path[i]) return;

                const cartesian = Player.cartesian(player.path[i], player.speed);
                player.x += cartesian.x;
                player.y += cartesian.y;

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

                player.potentialColliders.forEach(collider => {
                    if (findDistance(collider, player) < player.radius + collider.radius) {
                        if (Object.getPrototypeOf(collider).constructor == Player || Object.getPrototypeOf(collider).constructor == Bot) {
                            // Figuring out which player or bot is bigger
                            let [largerPlayer, smallerPlayer] = [undefined, undefined];
                            if (collider.radius > player.radius) {
                                largerPlayer = collider;
                                smallerPlayer = player;
                            } else if (collider.radius < player.radius) {
                                largerPlayer = player;
                                smallerPlayer = collider;
                            }
                            // Checking if their is a larger and smaller player in case they are the same size.
                            if (largerPlayer && smallerPlayer) {
                                if (player.radius < 0.25 && Object.getPrototypeOf(player).constructor == Bot) player.radius += 0.0001;
                                if (player.radius < 0.5 && Object.getPrototypeOf(player).constructor == Player) player.radius += 0.001;

                                smallerPlayer.radius -= 0.001;
                            }
                        } else {
                            // The if statement here is smaller than it is for eating player which prevents you from gaining size from pellets once you have hit a certain size
                            if (player.radius < 0.25 && Object.getPrototypeOf(player).constructor == Bot) player.radius += 0.0001;
                            if (player.radius < 0.25 && Object.getPrototypeOf(player).constructor == Player) player.radius += 0.0003;
                            collider.radius -= 0.003;
                        }


                    }
                });
            });
        });

        // Detecting if a player has died because they have a radius of 0 or less.
        Object.values(players).forEach((player, index) => {
            if (player.radius <= 0) {
                // This triggers a listener
                sockets[Object.keys(players)[index]].emit("playerDied", undefined);

                delete players[Object.keys(players)[index]];
            }
        });

        Object.keys(sockets).forEach(key => {
            let socket = sockets[key];
            let player = players[key];
            // console.log(player);
            if (!player) return;

            player.path = [];

            // Sending the client the array of pellets so the client can draw them
            socket.emit("pelletsUpdate", pellets.filter(p => checkIfVisible(p, player, 0.25)));

            // Sending the client a list of bots and players.
            // I am able to send them both because the Bot class is an extension of the Player class so any methods or properties of the Player class that the client need will also be methods or properties of the Bot class
            io.emit("playersUpdate", Object.values(players).concat(bots).filter(p => checkIfVisible(p, player, 0.5)).map(player => {
                // Minimal info just simplifies the player object to only contain visual info and the player's id in order to have cyber security and to not send too much data
                return player.minimalInfo;
            }));
        });


    }, 1000 / sendrate);
}

/**
 * Checks if an object can be seen by a player or if an object is within a certain distance of the player's view
 * @param {Object} gameObject An object with an x y and radius
 * @param {number} gameObject.x The x position of the game object
 * @param {number} gameObject.y The y position of the game object
 * @param {number} gameObject.radius The radius of the game object
 * @param {Player} player The player who's visibility you are checking
 * @param {number} [extraViewDistance] How much father away from the player's view you want to check to compensate for the player moving (defaults to 0)
 * @returns {boolean}
 */
function checkIfVisible(gameObject, player, extraViewDistance = 0) {
    if (!gameObject || !player) {
        console.log("Player or game object isn't defined :", gameObject, player);
        return false;
    }
    const relativePos = { x: gameObject.x - player.x, y: gameObject.y - player.y };

    return (Math.abs(relativePos.x) - gameObject.radius <= 0.5 + extraViewDistance) && (Math.abs(relativePos.y) - gameObject.radius <= 0.5 + extraViewDistance);
}

/**
 * Finds the distance between two objects with x and y values
 * @param {Object} object1 An object
 * @param {number} object1.x the object's x position
 * @param {number} object1.y the object's y position
 * @param {Object} object2 An object
 * @param {number} object2.x the object's x position
 * @param {number} object2.y the object's y position
 * @returns {number}
 */
function findDistance(object1, object2) {
    return Math.sqrt((object1.x - object2.x) ** 2 + (object1.y - object2.y) ** 2);
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