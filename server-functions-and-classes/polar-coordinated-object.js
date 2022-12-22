class PolarCoordinatedObject {
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

    constructor (x, y) {
        this.x = x;
        this.y = y;
    }

    get angle () {
        return Math.atan2(this.y, this.x);
    }

    get magnitude() {
        return this.x/Math.cos(this.angle);
    }
}

module.exports = { PolarCoordinatedObject };