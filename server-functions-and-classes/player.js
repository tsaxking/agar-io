const { PolarCoordinatedObject } = require("./polar-coordinated-object");

class Player extends PolarCoordinatedObject {
    constructor (x, y, radius, id, color) {
        super(x, y);

        this.radius = radius;
        this.pressedKeys = {};
        this.velocity = { x: 0, y: 0 }
        this.id = id;
        this.color = color;
    }

    get speed () {
        return 0.001/(this.radius ** 0.5);
    }

    get minimalInfo () {
        const { x, y, radius, id, color } = this;
        return { x, y, radius, id, color };
    }
    
    split() {
        if (this.radius < 0.04) return;
        this.velocity.x *= 3;
        this.velocity.y *= 3;
        this.radius = Math.floor(this.radius * 250)/1000;
    }
}

module.exports = { Player };