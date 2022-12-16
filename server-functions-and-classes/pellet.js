const { PolarCoordinatedObject } = require("./polar-coordinated-object");

class Pellet extends PolarCoordinatedObject {
    /**
     * Creates a pellet that can be eaten and stuff
     * @param {number} x The x coordinate of the pellet
     * @param {number} y The y coordinate of the pellet
     * @param {string} color The color of the pellet; Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {number} [radius] the radius of the pellet, set to 0.01 by default 
     */
    constructor (x, y, color, radius = 0.01) {
        super(x, y);

        this.color = color;
        this.radius = radius;
    }
}

module.exports = { Pellet };