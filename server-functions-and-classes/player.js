const { Mouse } = require("./Mouse");

class Player {
    constructor (x, y, radius) {
        // Don't have to scale the x or y because they are already normalized
        this.x = x == "random" ? Math.random(): x;
        this.y = y == "random" ? Math.random(): y;
        this.radius = radius;
        this.pressedKeys = {};
        this.mouse = new Mouse(0, 0, false)
        this.velocity = { x: 0, y: 0 }
    }

    get speed () {
        return 0.002/(this.radius ** 0.5);
    }
}

module.exports = { Player, Mouse };