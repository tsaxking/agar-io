const { Router } = require('express');

const router = Router();

const setSocket = (io) => {
    io.on("connect", (socket) => {

        console.log('New user has connected:', socket.id);

        socket.on('username', (username) => {
            const allowed = Object.values(players).reduce(player => {
                if (player.username === username) {
                    return false;
                }
            }, true);

            if (!allowed) {
                socket.emit("username", false);
                return;
            }

            players[socket.id].username = username;
        });

        socket.on("playerUpdate", ({ angle }) => {
            // Gets the exiting player data from an object stored on the server
            let player = players[socket.id];

            // Checks if no data exists
            if (!player) {
                // If there isn't any data it creates new data
                players[socket.id] = defaultPlayer();
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

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
            delete players[socket.id];

            io.emit("playerUpdate", Object.values(players));
        });
    });
}



const interval = setInterval(() => {
    Object.values(players).forEach(player => {
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

        ["x", "y"].forEach((coordinate) => {
            if (player[coordinate] - player.radius < 0) {
                player[coordinate] = player.radius;
                player.velocity[coordinate] *= -0.0;
            } else if (player[coordinate] + player.radius > mapSize) {
                player.velocity[coordinate] *= -0.0;
                player[coordinate] = mapSize - player.radius;
            }
        });

        Object.values(players).forEach(collidingPlayer => {
            const distance = Math.sqrt((player.x - collidingPlayer.x) ** 2 + (player.y - collidingPlayer.y) ** 2);
            if (distance <= collidingPlayer.radius + player.radius) {
                let [largerPlayer, smallerPlayer] = [undefined, undefined];
                if (collidingPlayer.radius > player.radius) {
                    largerPlayer = collidingPlayer;
                    smallerPlayer = player;
                } else if (collidingPlayer.radius < player.radius) {
                    largerPlayer = player;
                    smallerPlayer = collidingPlayer;
                } else {
                    // const tempVelocity = Object.assign({}, player.velocity);
                    // player.velocity = collidingPlayer.velocity;
                    // collidingPlayer.velocity = tempVelocity;
                    // if (Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2) > Math.sqrt(collidingPlayer.velocity.x ** 2 + collidingPlayer.velocity.y ** 2)) {
                    //     largerPlayer = player;
                    //     smallerPlayer = collidingPlayer
                    // } else if (Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2) < Math.sqrt(collidingPlayer.velocity.x ** 2 + collidingPlayer.velocity.y ** 2)){
                    //     largerPlayer = collidingPlayer;
                    //     smallerPlayer = player;
                    // }
                }
                if (largerPlayer && smallerPlayer) {
                    if (largerPlayer.radius < 0.5) largerPlayer.radius += 0.001;
                    smallerPlayer.radius -= 0.001;
                }
            }
        });

        pellets.forEach(pellet => {
            const distance = Math.sqrt((player.x - pellet.x) ** 2 + (player.y - pellet.y) ** 2);
            if (distance <= pellet.radius + player.radius) {
                if (player.radius < 0.5) player.radius += 0.0001;
                pellet.radius -= 0.001;
            }
        });
        pellets = pellets.filter(p => p.radius > 0);
        if (pellets.length < 100) pellets = [
            ...Array(100 - pellets.length)
            .fill()
            .map(createPellet),
            ...pellets
        ];
    });

    // Detecting if a player has died because they have a radius of 0 or less.
    Object.values(players).forEach((player, index) => {
        if (player.radius <= 0) {
            sockets[Object.keys(players)[index]].emit("playerDied", undefined);

            delete players[Object.keys(players)[index]];
        }
    });
    io.emit("pelletsUpdate", pellets);
    io.emit("playersUpdate", Object.values(players).map(player => {
        return player.minimalInfo;
    }));
}, 1000 / 120)

const port = process.env.PORT || 2000;

app.use("/static", express.static(path.resolve(__dirname, "./static")));

app.get("/*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "./templates/index.html"))
});


module.exports = {
    agarioRoute,
    setSocket
};