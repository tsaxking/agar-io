const express = require('express');
const res = require('express/lib/response');
const app = express();

'localhost:2000/'

app.get('/*', (req, res, next) => {
    const html = fs.readFileSync(path.resolve(__dirname, './templates/index.html'), 'utf-8');

    res.send(html);
});






const port = 2000;

app.listen(port, () => {
    console.log('------');
    console.log(`server listening on port ${port}...`);
});