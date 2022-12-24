// Installing npm packages
const express = require("express");
const http = require("http");
const path = require("path");
const { initialize, agarRouter } = require("./index.js");

// Setting up socket.io
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

initialize(io);

const port = process.env.PORT || 2000;

app.use("/agar.io", agarRouter);

// Assigning the server to listen on a port
server.listen(port, () => {
    console.log(`\n\n\n Server started on port ${port}`);
}).on('error', (e) => {
    console.error(e);
}).on('close', () => {
    console.log("server closed");
});