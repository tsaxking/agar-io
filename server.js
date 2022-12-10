const express = require("express");
const http = require("http");
const path = require("path");
const { Pellet } = require("./server-functions-and-classes/pellet");
const { Player } = require("./server-functions-and-classes/player");


const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const mapSize = 5;
let playerCount = 0
const defaultPlayer = () => {
    playerCount ++;
    return new Player(Math.random() * mapSize, Math.random() * mapSize, 0.02, playerCount);
};
const players = {}
const randomColor = () => Math.floor(Math.random() * 256)
const createPellet = () => new Pellet(Math.random() * mapSize, Math.random() * mapSize, `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`);
let pellets = Array(20 * mapSize ** 2).fill().map(createPellet);
io.on("connect", (socket) => {

    console.log('New user has connected:', socket.id);
    socket.on("playerUpdate", ({ angle }) => {
        let player = players[socket.id];
        if (!player) {
            players[socket.id] = defaultPlayer();
            socket.emit("id", playerCount);
            player = players[socket.id];
        }

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
            if (player[coordinate] - player.radius < 0 ) {
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
                if (player.radius < 0.5) player.radius += 0.001; 
                pellet.radius -= 0.01;
            }
        });
        pellets = pellets.filter(p => p.radius > 0);
        if (pellets.length < 100) pellets = [...Array(100 - pellets.length).fill().map(createPellet), ...pellets];
    });

    // Detecting if a player has died because they have a radius of 0 or less.
    Object.values(players).forEach((player, index) => {
        if (player.radius <= 0) {
            delete players[Object.keys(players)[index]];
        }
    });
    io.emit("pelletsUpdate", pellets);
    io.emit("playersUpdate", Object.values(players).map(player => {
        return player.minimalInfo;
    }));
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