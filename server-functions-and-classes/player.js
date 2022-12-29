const { PolarCoordinatedObject } = require("./polar-coordinated-object");

class Player extends PolarCoordinatedObject {
    /**
     * Creates a new player
     * @param {number} x The x position of the player
     * @param {number} y The y position of the player
     * @param {number} radius The radius of the player
     * @param {number} id The player's id (not the socket id), which the client can use to tell which player it is
     * @param {Object} color an object containing r, g, b, and alpha values
     * @param {number} color.r how red the player should be (0 <= r < 256)
     * @param {number} color.g how green the player should be (0 <= g < 256)
     * @param {number} color.b how blue the player should be (0 <= b < 256)
     * @param {number} [color.alpha] the transparency of the player (0-1)
     * @param {string} [username] The username of the player. Defaults to "Default Username"
     */
    constructor (x, y, radius, id, color, baseSpeed, username = "Default Username") {
        super(x, y);

        this.radius = radius;
        this.pressedKeys = {};
        this.velocity = { x: 0, y: 0 }
        this.id = id;
        this.color = color;
        this.username = username;
        this.baseSpeed = baseSpeed;
    }

    // Gets how fast the player can go based off their radius
    get speed () {
        return 0.9/this.baseSpeed - (this.radius/100);
    }

    // Simplifies the player object to only contain visual info and the player's id in order to have cyber security and to not send too much data
    get minimalInfo () {
        const { x, y, radius, id, color, username, velocity } = this;
        return { x, y, radius, id, color, username, velocity };
    }
}

module.exports = { Player, PolarCoordinatedObject };