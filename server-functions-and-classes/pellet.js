const { PolarCoordinatedObject } = require("./polar-coordinated-object");

class Pellet extends PolarCoordinatedObject {
    constructor (x, y, color, radius = 0.01) {
        super(x, y);

        this.color = color;
        this.radius = radius;
    }
}

module.exports = { Pellet };