class Player {
    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.pressedKeys = {};
        this.mouse = { x: 0, y: 0}
        this.velocity = { x: 0, y: 0 }
    }
}

module.exports = { Player };