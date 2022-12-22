//TODO: make coordinate be a class that player, mouse and pellet are all extended from

class Mouse {
    /**
     * Converts cartesian coordinates to polar coordinates
     * @param {number} x An x value
     * @param {number} y A y value
     */
    static polar (x, y) {
        const angle = Math.atan2(y, x);
        return { angle, magnitude: x/Math.cos(angle) };
    }

    static cartesian (angle, magnitude) {
        return { x: Math.cos(angle) * magnitude, y:  Math.sin(angle) * magnitude };
    }
    constructor(x, y, down) {
        this.x = x;
        this.y = y;
        this.down = down;
    }

    get angle () {
        return Math.atan2(this.y, this.x);
    }

    get magnitude() {
        return this.x/Math.cos(this.angle);
    }

    setXY (angle, magnitude) {
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;
    }
}

module.exports = { Mouse };