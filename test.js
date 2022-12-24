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

// Sending all the javascript and css files to the client
app.use("/static", express.static(path.resolve(__dirname, "./static")));

// Sending the index.html file to the client
app.get("/*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "./templates/index.html"))
});

// Assigning the server to listen on a port
server.listen(port, () => {
    console.log(`\n\n\n Server started on port ${port}`);
}).on('error', (e) => {
    console.error(e);
}).on('close', () => {
    console.log("server closed");
});