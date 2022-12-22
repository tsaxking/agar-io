const express = require("express");
const http = require("http");
const path = require("path");
const { Pellet } = require("./server-functions-and-classes/pellet.js");
const { Player } = require("./server-functions-and-classes/player.js");
const { agarioRoute, setSocket } = require("./server-functions-and-classes/router.js");


const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);

const mapSize = 5;
let playerCount = 0
const defaultPlayer = () => {
    playerCount++;
    return new Player(Math.random() * mapSize, Math.random() * mapSize, 0.02, playerCount, { r: randomColor(), g: randomColor(), b: randomColor() });
};
const players = {};
const sockets = {};
const randomColor = () => Math.floor(Math.random() * 256);
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
let pellets = Array(20 * mapSize ** 2).fill().map(createPellet);

app.use('/agar.io', agarioRoute);

server.listen(port, () => {
    console.log(`\n\n\n Server started on port ${port}`);
}).on('error', (e) => {
    console.error(e);
}).on('close', () => {
    console.log("server closed");
});