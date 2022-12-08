const express = require("express");
const http = require("http");
const path = require("path");
const { Player } = require("./server-functions-and-classes/player");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const defaultPlayer = () => new Player("random", "random", 0.01);
const players = {}
io.on("connect", (socket) => {

    console.log('New user has connected:', socket.id);

    socket.on("playerUpdate", ({ pressedKeys, mouse }) => {
        let player = players[socket.id];
        if (!player) {
            players[socket.id] = defaultPlayer();
            player = players[socket.id];
        }

        player.pressedKeys = pressedKeys;
        player.mouse = mouse;
        if (pressedKeys["a"] && player.velocity.x > -0.05) {
            player.velocity.x -= 0.001;
        }
        if (pressedKeys["d"] && player.velocity.x < 0.05) {
            player.velocity.x += 0.001;
        }
        if (pressedKeys["w"] && player.velocity.y > -0.05) {
            player.velocity.y -= 0.001;
        }
        if (pressedKeys["s"] && player.velocity.y < 0.05) {
            player.velocity.y += 0.001;
        }

        socket.emit("playerUpdate", player);
        io.emit("playersUpdate", Object.values(players));
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
        delete players[socket.id];

        io.emit("playerUpdate", Object.values(players));
    });
});

const interval = setInterval(() => {
    Object.values(players).forEach(player => {
        player.x += player.velocity.x;
        player.y += player.velocity.y;
        player.velocity.x -= Math.sign(player.velocity.x) * 0.0015;
        player.velocity.y -= Math.sign(player.velocity.y) * 0.0015;
        if (Math.abs(player.velocity.x) < 0.001) {
            player.velocity.x = 0;
        }
        if (Math.abs(player.velocity.y) < 0.001) {
            player.velocity.y = 0;
        }

        ["x", "y"].forEach((coordinate) => {
            if (player[coordinate] - player.radius < 0 ) {
                player[coordinate] = player.radius;
                player.velocity[coordinate] *= -1;
            } else if (player[coordinate] + player.radius > 1) {
                player.velocity[coordinate] *= -1;
                player[coordinate] = 1 - player.radius;
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
                    if (Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2) > Math.sqrt(collidingPlayer.velocity.x ** 2 + collidingPlayer.velocity.y ** 2)) {
                        largerPlayer = player;
                        smallerPlayer = collidingPlayer
                    } else if (Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2) < Math.sqrt(collidingPlayer.velocity.x ** 2 + collidingPlayer.velocity.y ** 2)){
                        largerPlayer = collidingPlayer;
                        smallerPlayer = player;
                    }
                }
                if (largerPlayer && smallerPlayer) {
                    if (largerPlayer.radius < 0.5) largerPlayer.radius += 0.001;
                    smallerPlayer.radius -= 0.001;
                }
            }
        });
    });

    // Detecting if a player has died because they have a radius of 0 or less.
    Object.values(players).forEach((player, index) => {
        if (player.radius <= 0) {
            delete players[Object.keys(players)[index]];
    
            io.emit("playerUpdate", Object.values(players));
        }
    })
}, 50)

const port = process.env.PORT || 8080;

app.use("/static", express.static(path.resolve(__dirname, "./static")));

app.get("/*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "./templates/index.html"))
});

server.listen(port, () => {
    console.log(`\n\n\n Server started on port ${port}`);
}).on('error', (e) => {
    console.error(e);
}).on('close', () => {
    console.log("server closed");
});