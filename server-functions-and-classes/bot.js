const { Player, PolarCoordinatedObject } = require("./player");

class Bot extends Player {
    constructor(x, y, radius, color) {
        super(x, y, radius, -1, color);
    }

    pathFind(pellets, players) {
        let closestPlayer;
        let closestPlayerDistance;
        const smallerPlayers = players.filter(p => p.radius < this.radius);
        smallerPlayers.forEach(player => {
            const playerDistance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
            if (!closestPlayerDistance || playerDistance < closestPlayerDistance) {
                closestPlayer = player;
                closestPlayerDistance = playerDistance;
            }
        });

        let closestPellet;
        let closestPelletDistance;

        pellets.forEach(pellet => {
            const pelletDistance = Math.sqrt((pellet.x - this.x) ** 2 + (pellet.y - this.y) ** 2);
            if (!closestPelletDistance || pelletDistance < closestPelletDistance) {
                closestPellet = pellet;
                closestPelletDistance = pelletDistance;
            }
        });

        // If no players are playing the server this code will still run so that's why it detects whether there is a closest player.
        if (closestPlayer) {
            this.goTowardsObject(closestPlayer);
        } else if (players.length > 0) {
            this.goTowardsObject(closestPellet);
        }
    }

    /**
     * 
     * @param {PolarCoordinatedObject} object 
     */
    goTowardsObject(object) {
        const { angle, magnitude } = PolarCoordinatedObject.polar(object.x - this.x, object.y - this.y);
        const distance = magnitude < this.speed ? magnitude : this.speed;
        const cartesian = PolarCoordinatedObject.cartesian(angle, distance);
        this.velocity.x = cartesian.x;
        this.velocity.y = cartesian.y;
    }
}

module.exports = { Bot, Player, PolarCoordinatedObject }