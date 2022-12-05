const express = require("express");
const http = require("http");
const path = require("path");
const { Player } = require("./server-functions-and-classes/player");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const defaultPlayer = () => new Player(0.5, 0.5, 0.01);
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
        if (pressedKeys["a"]) {
            player.velocity.x -= 0.001;
        }
        if (pressedKeys["d"]) {
            player.velocity.x += 0.001;
        }
        if (pressedKeys["w"]) {
            player.velocity.y -= 0.001;
        }
        if (pressedKeys["s"]) {
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
        player.velocity.x -= Math.sign(player.velocity.x) * 0.0005;
        player.velocity.y -= Math.sign(player.velocity.y) * 0.0005;
    });
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