class Component {
    /**
     * A basic component that serves as the parent class for all other components (mostly just so that if I ever use type script i can have a function take in type component and it will have a draw function that doesn't cause any thing to crash)
     * @param {number} x The x coordinate of the component (Normalized to canvas width)
     * @param {number} y The y coordinate of the component (Normalized to canvas width)
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * just here for typescript stuff
     * @param {Node} canvas AN html canvas element
     * @param {Node} scaleFactor A scaleFactor to scale the component by
     */
    draw(canvas, scaleFactor) {

    }
}

class Rect extends Component {
    /**
     * Literally just a rectangle
     * @param {number} x The x coordinate of the rect (Normalized to canvas width)
     * @param {number} y The y coordinate of the rect (Normalized to canvas width)
     * @param {number} width The width of the rectangle (Normalized to canvas width)
     * @param {number} height The height of the rectangle (Normalized to canvas width)
     * @param {string} color The color of the rectangle. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {boolean} centered Whether or not the center of the rectangle at the x and y coordinates, it false it will left align the rectangle
     */
    constructor (x, y, z, width, height, color, centered) {
        super(x, y, z);
        this.width = width;
        this.height = height;
        this.color = color;
        this.centered = centered;
    }

    draw (canvas, scaleFactor) {
        const ctx = canvas.getContext("2d");
        const scaledX = scaleFactor * this.x;
        const scaledY = scaleFactor * this.y;
        const scaledWidth = scaleFactor * this.width;
        // Not normalized to canvas height because then the aspect ratio isn't preserved
        const scaledHeight = scaleFactor * this.height;
        ctx.fillStyle = this.color;
        if (this.centered) {
            ctx.fillRect(scaledX - scaledWidth/2, scaledY - scaledHeight/2, scaledWidth, scaledHeight);
        } else {
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }
    }
}
class Grid extends Rect {
    /**
     * A bunch of lines perpendicular to each other which form a grid
     * @param {number} x The x coordinate of the grid (Normalized to canvas width)
     * @param {number} y The y coordinate of the grid (Normalized to canvas width)
     * @param {number} width The width of the grid (Normalized to canvas width)
     * @param {number} height The height of the grid (Normalized to canvas width)
     * @param {string} color The color of the grid. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {boolean} centered Whether or not the center of the grid at the x and y coordinates, it false it will left align the rectangle
     * @param {number} linesAmount The amount of lines (in one direction so if you put 10 it will draw 10 lines on the x and ten on the y)
     */
    constructor (x, y, z, width, height, color, centered, linesAmount) {
        super(x, y, z, width, height, color, centered);
        this.linesAmount = linesAmount;
    }
    draw(canvas, scaleFactor) {
        super.draw(canvas, scaleFactor);
        const scaledX = scaleFactor * this.x;
        const scaledY = scaleFactor * this.y;
        const spacing = (this.width * scaleFactor)/this.linesAmount + 1;
        const ctx = canvas.getContext("2d");        

        ctx.strokeStyle = `rgb(0, 0, 0)`;

        for (let i = scaledX; i <= scaledX + scaleFactor * this.width; i += spacing) {
            // ctx.lineWidth = 1;
            // ctx.beginPath();
            // ctx.moveTo(i, scaledY);
            // ctx.lineTo(i, scaledY + scaleFactor *this.width);
            // ctx.closePath();
            // ctx.stroke();

            for (let j = scaledY; j <= scaledY + scaleFactor * this.width; j += spacing) {
                // ctx.lineWidth = 1;
                // ctx.beginPath();
                // ctx.moveTo(scaledX, i);
                // ctx.lineTo(scaledX + scaleFactor * this.width, i);
                // ctx.closePath();
                // ctx.stroke();
                new Circle(i, j, 10, spacing * 0.1, "rgba(200, 200, 200, 0.75)").draw(canvas, 1);
            }
        }

        
    }
}

class Square extends Rect {
    /**
     * A square
     * @param {number} x The x coordinate of the square (Normalized to canvas width)
     * @param {number} y The y coordinate of the square (Normalized to canvas width)
     * @param {number} width The width of the square (Normalized to canvas width)
     * @param {number} height The height of the square (Normalized to canvas width)
     * @param {string} color The color of the square. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {boolean} centered Whether or not the center of the square at the x and y coordinates, it false it will left align the square
     */
    constructor (x, y, z, width, color, centered) {
        super (x, y, z, width, width, color, centered);
    }
}

// Can't use the name Text because it is already used
class TextComponent extends Component {
    /**
     * Text
     * @param {number} x The x value of the text (Normalized to canvas width)
     * @param {number} y The y value of the text (Normalized to canvas width)
     * @param {string} color The color of the text. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {number} height The height of the text (Normalized to canvas width)
     * @param {string} font The text font ex. Arial or Helvetica
     * @param {string} value What the text says
     * @param {boolean} centered Whether the text is centered or left align
     */
    constructor (x, y, z, color, height, font, value, centered) {
        super (x, y, z);
        this.color = color;
        this.height = height;
        this.font = font;
        this.value = value;
        this.centered = centered;
    }

    canvasFont (scaleFactor) {
        return `${Math.round(this.height * scaleFactor)}px ${this.font}`
    }

    width(canvas) {
        return canvas.getContext('2d').measureText(this.value).width;
    }

    draw(canvas, scaleFactor) {
        const ctx = canvas.getContext("2d");
        ctx.font = this.canvasFont(scaleFactor);
        ctx.fillStyle = this.color;
        const x = this.centered ? this.x * scaleFactor - this.width(canvas)/2: this.x * scaleFactor;
        ctx.fillText(this.value, x, this.y * scaleFactor - this.height * scaleFactor/2);
    }
}


class Button extends Rect { 
    /**
     * Creates a button that will do stuff when clicked on
     * @param {number} x The x of the button
     * @param {number} y The y of the button
     * @param {number} width The width of the button
     * @param {number} height The height of the button
     * @param {string} color The color of the button. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {boolean} centered Whether or not the center of the button at the x and y coordinates, it false it will left align the button
     * @param {Function} action What the button does when clicked on
     */
    constructor(x, y, z, width, height, color, centered, action) {
        super(x, y, z, width, height, color, centered);
        this.action = action;
    }

    onClickEvent (event, canvas) {
        const scaledX = largerWindowDimension * this.x;
        const scaledY = largerWindowDimension * this.y;
        const mouseX = (event.pageX + largerWindowDimension/2 - window.innerWidth/2);
        const mouseY = (event.pageY + largerWindowDimension/2 - window.innerHeight/2);
        console.log(mouseX - scaledX, mouseY - scaledY);
        const scaledWidth = largerWindowDimension * this.width;
        // Not normalized to canvas height because then the aspect ratio isn't preserved
        const scaledHeight = largerWindowDimension * this.height;
        // Checking if the user clicked within this button
        if (Math.abs(mouseX - scaledX) <= scaledWidth/2 && Math.abs(mouseY - scaledY) <= scaledHeight/2) {
            this.action(event);
        }
    }
}

class Menu extends Rect {
    /**
     * A menu which has a background and subComponents which are automatically formatted
     * @param {number} x The x value of the menu (Scaled to canvas width)
     * @param {number} y The y value of the menu (Scaled to canvas width)
     * @param {number} width The width of the menu (Scaled to canvas width)
     * @param {number} height The height of the menu (Scaled to canvas width)
     * @param {string} color The color of the menu's background. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     * @param {boolean} centered Whether or not the center of the menu at the x and y coordinates, it false it will left align the menu
     * @param {Array.<Component>} subComponents An array of components inside the menu
     */
    constructor(x, y, z, width, height, color, subComponents) {
        super(x, y, z, width, height, color, true);
        this.subComponents = subComponents;
        this.positionSubComponents();
    }

    positionSubComponents() {
        const margin = 0.01;
        let currentX = this.x - this.width/2 + margin;
        let currentY = this.y - this.height/2 + margin;
        let tallestComponentInRow = 0;
        this.subComponents.forEach(component => {
            component.centered = false;
            if (currentX + component.width > this.x + this.width/2 - margin) {
                currentX = this.x - this.width/2 + margin;
                currentY += tallestComponentInRow + margin;
                tallestComponentInRow = 0;
            }

            if (component.height > tallestComponentInRow) {
                tallestComponentInRow = component.height;
            }

            component.x = currentX + component.width/2;
            component.y = currentY + component.height/2;

            currentX += component.width + margin;
        });
    }

    onClickEvent(event, canvas) {
        this.subComponents.forEach(component => {
            if (component.onClickEvent) component.onClickEvent(event, canvas);
        })
    }

    draw(canvas, scaleFactor) {
        new Rect().draw.bind(this)(canvas);
        
        this.subComponents.forEach(c => c.draw(canvas));
    }
}

class Circle extends Component {
    /**
     * Circle with an x, y, radius, and color
     * @param {number} x The x coordinate of the circle (Normalized to canvas width)
     * @param {number} y The y coordinate of the circle (Normalized to canvas width)
     * @param {number} radius The radius of the circle (Normalized to canvas width)
     * @param {string} color The color of the circle. Can be expressed as:
     * - A name of a color like "red" or "blue"
     * - an "rgb(r, g, b)"
     * - an "rgba(r, g, b, a)" (A is for alpha)
     * - a hex like "#000000"
     */
    constructor(x, y, z, radius, color) {
        super (x, y, z);
        this.radius = radius;
        this.color = color;
    }
    draw (canvas, scaleFactor) {
        const ctx = canvas.getContext("2d");
        const scaledX = scaleFactor * this.x;
        const scaledY = scaleFactor * this.y;
        const scaledRadius = scaleFactor * this.radius;

        ctx.beginPath();
        // X and Y offset are to make the circle centered
        // ctx.arc(scaledX - scaledRadius/2, scaledY - scaledRadius/2, scaledRadius, 0, Math.PI * 2);
        if (scaledRadius < 0) {
            console.error("circle radius less then 0");//: ", scaledRadius);
            ctx.arc(scaledX, scaledY, 0, 0, Math.PI * 2);
        } else {
            ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
        }
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class GameCircle extends Circle {
    constructor(x, y, z, radius, color, actualX, actualY) {
        super(x, y, z, radius, color);
        this.actualX = actualX;
        this.actualY = actualY;
        this.isGameComponent = true;
    }

    updateCoordinates(relativePoint, middle) {
        this.x = this.actualX - relativePoint.x + middle;
        this.y = this.actualY - relativePoint.y + middle;
    }
}

class Player extends GameCircle {
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


    constructor(x, y, z, radius, color, actualX, actualY, velocity, username, id, baseSpeed) {
        super (x, y, z, radius, color, actualX, actualY);
        this.velocity = velocity;
        this.username = username;
        this.id = id;
        this.baseSpeed = baseSpeed;
    }
    
    get text () {
        return new TextComponent(this.x, this.y - this.radius, 100, "rgb(0, 0, 0)", 0.01, "Arial", this.username, true);
    }

    // Finds the angle of this object relative to the orgin
    get angle () {
        return Math.atan2(this.y, this.x);
    }

    // Finds the distance between this object and the orgin
    get magnitude() {
        return this.x/Math.cos(this.angle);
    }

    get speed () {
        return 0.3/this.baseSpeed - (this.radius/100);
    }

    draw(canvas, scaleFactor) {
        super.draw(canvas, scaleFactor);

        this.text.draw(canvas, scaleFactor);
    }
}