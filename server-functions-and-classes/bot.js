// Importing the Player class
const { Player, PolarCoordinatedObject } = require("./player");

class Bot extends Player {
    /**
     * Creates a bot that will automatically pathfind and act like a fake player
     * @param {number} x The starting x-position of the bot
     * @param {number} y The starting y-position of the bot 
     * @param {number} radius The radius of the bot (its a circle)
     * @param {Object} color an object containing r, g, b, and alpha values
     * @param {number} color.r how red the bot should be (0 <= r < 256)
     * @param {number} color.g how green the bot should be (0 <= g < 256)
     * @param {number} color.b how blue the bot should be (0 <= b < 256)
     * @param {number} [color.alpha] the transparency of the bot (0-1)
     * @param {string} [username] The username of the player. Defaults to "Bot"
     */
    constructor(x, y, radius, color, tickrate, username = "Bot") {
        super(x, y, radius, -1, color, tickrate*2, username);
    }

    /**
     * Changes the bot's velocity in order to point it towards a pellet or payer based off the sizes of the players
     * @param {Pellet[]} pellets an array of every pellet
     * @param {Player[]} players an array of every player 
     */
    pathFind(pellets, players) {
        let closestPlayer;
        let closestPlayerDistance;

        // creates an array that only contains players with a smaller radius then you
        const smallerPlayers = players.filter(p => p.radius < this.radius);

        // TODO: make this use Array.prototype.sort() instead of how I'm doing it now
        // goes through each of these players and finds which one is the closest to you
        smallerPlayers.forEach(player => {
            const playerDistance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
            if (!closestPlayerDistance || playerDistance < closestPlayerDistance) {
                closestPlayer = player;
                closestPlayerDistance = playerDistance;
            }
        });

        // If no players are playing the server this code will still run so that's why it detects whether there is a closest player.
        if (closestPlayer) {
            this.goTowardsObject(closestPlayer);
        // Checking if there are any players so that the bots aren't constantly getting larger while the server is just running
        } else if (players.length > 0) {
            let closestPellet;
            let closestPelletDistance;

            // Finds the closest pellet
            pellets.forEach(pellet => {
                const pelletDistance = Math.sqrt((pellet.x - this.x) ** 2 + (pellet.y - this.y) ** 2);
                if (!closestPelletDistance || pelletDistance < closestPelletDistance) {
                    closestPellet = pellet;
                    closestPelletDistance = pelletDistance;
                }
            });
            this.goTowardsObject(closestPellet);
        }
    }

    /**
     * Changes the velocity of this bot so that it will move towards another object
     * @param {PolarCoordinatedObject} object An object with an x and y position as well as all the methods and getters of the PolarCoordinatedObject class
     */
    goTowardsObject(object) {
        // Getting the angle (direction) and magnitude of the vector between this bot and the other object
        const { angle, magnitude } = PolarCoordinatedObject.polar(object.x - this.x, object.y - this.y);

        // Changing the total speed of the bot to make sure it doesn't overshoot its target
        const distance = magnitude < this.speed ? magnitude : this.speed;
        
        // Getting the cartesian coordinates of the vector readjusted so that its magnitude is the bot's speed
        const cartesian = PolarCoordinatedObject.cartesian(angle, distance);
        this.velocity.x = cartesian.x;
        this.velocity.y = cartesian.y;
    }
}

module.exports = { Bot, Player, PolarCoordinatedObject }