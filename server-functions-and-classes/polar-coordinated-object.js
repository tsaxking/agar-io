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

    /**
     * Converts polar coordinates to cartesian coordinates
     * @param {number} angle The angle of the polar coordinates relative to to a point in radians 
     * @param {number} magnitude The distance from the point the angle is based off of
     * @returns 
     */
    static cartesian (angle, magnitude) {
        return { x: Math.cos(angle) * magnitude, y:  Math.sin(angle) * magnitude };
    }

    /**
     * Creates an object that has getters in order to give you the angle and magnitude of the object
     * @param {number} x The x position of the object in cartesian coordinates
     * @param {number} y The x position of the object in cartesian coordinates
     */
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }

    // Finds the angle of this object relative to the orgin
    get angle () {
        return Math.atan2(this.y, this.x);
    }

    // Finds the distance between this object and the orgin
    get magnitude() {
        return this.x/Math.cos(this.angle);
    }
}

module.exports = { PolarCoordinatedObject };