class Component {
    /**
     * A basic component that serves as the parent class for all other components (mostly just so that if I ever use type script i can have a function take in type component and it will have a draw function that doesn't cause any thing to crash)
     * @param {number} x The x coordinate of the component (Normalized to canvas width)
     * @param {number} y The y coordinate of the component (Normalized to canvas width)
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * just here for typescript stuff
     * @param {Node} canvas AN html canvas element
     */
    draw(canvas) {

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
    constructor (x, y, width, height, color, centered) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
        this.centered = centered;
    }

    draw (canvas) {
        const ctx = canvas.getContext("2d");
        const scaledX = largerWindowDimension * this.x;
        const scaledY = largerWindowDimension * this.y;
        const scaledWidth = largerWindowDimension * this.width;
        // Not normalized to canvas height because then the aspect ratio isn't preserved
        const scaledHeight = largerWindowDimension * this.height;
        ctx.fillStyle = this.color;
        if (this.centered) {
            ctx.fillRect(scaledX - scaledWidth/2, scaledY - scaledHeight/2, scaledWidth, scaledHeight);
        } else {
            ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
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
    constructor (x, y, width, color, centered) {
        super (x, y, width, width, color, centered);
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
    constructor (x, y, color, height, font, value, centered) {
        super (x, y);
        this.color = color;
        this.height = height;
        this.font = font;
        this.value = value;
        this.centered = centered;
    }

    canvasFont (canvas) {
        return `${Math.round(this.height * largerWindowDimension)}px ${this.font}`
    }

    width(canvas) {
        return canvas.getContext('2d').measureText(this.value).width;
    }

    draw(canvas) {
        const ctx = canvas.getContext("2d");
        ctx.font = this.canvasFont(canvas);
        ctx.fillStyle = this.color;
        const x = this.centered ? this.x * largerWindowDimension - this.width(canvas)/2: this.x * largerWindowDimension;
        ctx.fillText(this.value, x, this.y * largerWindowDimension - this.height * largerWindowDimension/2);
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
    constructor(x, y, width, height, color, centered, action) {
        super(x, y, width, height, color, centered);
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
    constructor(x, y, width, height, color, subComponents) {
        super(x, y, width, height, color, true);
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

    draw(canvas) {
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
    constructor(x, y, radius, color) {
        super (x, y);
        this.radius = radius;
        this.color = color;
    }
    draw (canvas) {
        const ctx = canvas.getContext("2d");
        const scaledX = largerWindowDimension * this.x;
        const scaledY = largerWindowDimension * this.y;
        const scaledRadius = largerWindowDimension * this.radius;

        ctx.beginPath();
        // X and Y offset are to make the circle centered
        // ctx.arc(scaledX - scaledRadius/2, scaledY - scaledRadius/2, scaledRadius, 0, Math.PI * 2);
        ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
