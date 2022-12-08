class Player {
    constructor (x, y, radius) {
        // Don't have to scale the x or y because they are already normalized
        this.x = x == "random" ? Math.random(): x;
        this.y = y == "random" ? Math.random(): y;
        this.radius = radius;
        this.pressedKeys = {};
        this.mouse = { x: 0, y: 0}
        this.velocity = { x: 0, y: 0 }
    }
}

module.exports = { Player };