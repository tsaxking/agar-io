const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();


app.get('/*', (req, res, next) => {
    const html = fs.readFileSync(path.resolve(__dirname, './templates/index.html'), 'utf-8');

    res.send(html);
});










const port = 2122; //doesn't matter like you smh

app.listen(port, () => {
    console.log('-----------------------------------')
    console.log(`Server listening on port ${port}...`);
});