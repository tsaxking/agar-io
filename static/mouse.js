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
        this.moved = false;
    }

    get angle () {
        return Math.atan2(this.y - 0.5, this.x - 0.5);
    }

    get magnitude() {
        return this.x/Math.cos(this.angle);
    }

    setXY (angle, magnitude) {
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;
    }

    checkMovement () {
        if (this.moved) {
            this.moved = false;
            return true;
        }
    }
}