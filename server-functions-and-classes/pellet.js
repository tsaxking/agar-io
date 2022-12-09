class Pellet {
    constructor (x, y, color, radius = 0.005) {
        // Don't have to scale the x or y because they are already normalized
        this.x = x == "random" ? Math.random(): x;
        this.y = y == "random" ? Math.random(): y;
        this.color = color;
        this.radius = radius;
    }
}

module.exports = { Pellet };