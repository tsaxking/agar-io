const socket = io();

class Page {
    constructor (name, components, onInterval) {
        this.name = name;
        this.components = components;
        this.onInterval = onInterval;
    }
    draw (canvas, scaleFactor) {
        try {
            this.components.forEach(c => c.draw(canvas, scaleFactor));
        } catch (e) {
            console.error(e);
            console.log(c);
        }
    }
}

let smallerWindowDimension = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
let largerWindowDimension = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
const canvas = document.querySelector("#canvas");
const minimap = document.querySelector("#minimap-canvas");
let minimapComponents = [];
const canvasContainer = document.querySelector("#canvas-container");

canvas.style.position = "absolute";
canvasContainer.style.position = "relative";


canvas.width = largerWindowDimension;
canvas.height = largerWindowDimension;
canvas.style.left = window.innerWidth/2 - largerWindowDimension/2 + "px";
canvas.style.top = window.innerHeight/2 - largerWindowDimension/2 + "px";

minimap.width = largerWindowDimension/10;
minimap.height = largerWindowDimension/10;
minimap.style.left = window.innerWidth - largerWindowDimension/10 + "px";
minimap.style.top = 0 + "px";
minimap.style.position = "absolute";

window.addEventListener("resize", () => {
    smallerWindowDimension = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    largerWindowDimension = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;

    canvas.width = largerWindowDimension;
    canvas.height = largerWindowDimension;
    canvas.style.left = window.innerWidth/2 - largerWindowDimension/2 + "px";
    canvas.style.top = window.innerHeight/2 - largerWindowDimension/2 + "px";

    minimap.width = largerWindowDimension/10;
    minimap.height = largerWindowDimension/10;
    minimap.style.left = window.innerWidth - largerWindowDimension/10 + "px";
});

const canvasBackground = new Grid(0, 0, 5, 5, "rgb(225, 225, 225)", false, 150);
const minimapBackground = new Rect(0, 0, 10, 10, "rgb(200, 200, 200)", false);

const player = new Circle(0.5, 0.5, 0.01, "rgb(125, 125, 125)");

const pages = {
    main: new Page ("main", [
        new Button (0.5, 0.5, 0.25, 0.25, "rgb(125, 125, 125)", true, () => {
            changePage("game");
        }),
        new TextComponent(0.5, 0.5, "black", 0.03, "Arial", "Join Game", true)
    ], () => {}),
    game: new Page ("game", [
        player
    ], () => {
        socket.emit("playerUpdate", { pressedKeys, mouse });
    })
}

let currentPage = pages["main"];

function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changePage(pageName) {
    // Add page change listeners here

    //Changing the [age]
    currentPage = pages[pageName];
}

socket.on("playerUpdate", serverPlayer => {
    player.x = serverPlayer.x;
    player.y = serverPlayer.y;
    player.radius = serverPlayer.radius;
})

socket.on("playersUpdate", players => {
    const gameComponents = pages["game"].components;
    players.forEach(p => {
        const newX = p.x - player.x + 0.5;
        const newY = p.y - player.y + 0.5;
        minimapComponents.push(new Circle(newX + 4.5, newY + 4.5, p.radius * 10, "rgba(0, 0, 0, 0.75)"));
        if (newX < 0 || newX > 1 || newY > 1 || newY < 0) return;
        gameComponents.push(new Circle(newX, newY, p.radius, "rgb(0, 0, 0)"));
    });
    // pages["game"].components.push(player);
});

socket.on("pelletsUpdate", pellets => {
    pages["game"].components = [];
    minimapComponents = [];
    const gameComponents = pages["game"].components;
    pellets.forEach(p => {
        const newX = p.x - player.x + 0.5;
        const newY = p.y - player.y + 0.5;
        minimapComponents.push(new Circle(newX + 4.5, newY + 4.5, p.radius * 5, p.color));
        if (newX < 0 || newX > 1 || newY > 1 || newY < 0) return;
        gameComponents.push(new Circle(newX, newY, p.radius, p.color));
    });
});
document.addEventListener("click", (event) => {
    currentPage.components.forEach(component => {
        if (component.onClickEvent) component.onClickEvent(event, canvas);
    });
});

const pressedKeys = {};
const mouse = new Mouse(0, 0, false);

window.addEventListener("visibilitychange", () => {
    if (document.visibilityState == "hidden") Object.keys(pressedKeys).forEach(k => delete pressedKeys[k]);
});

document.addEventListener("keydown", (e) => {
    try { e.key.toLowerCase() } catch { return }

    pressedKeys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    try { e.key.toLowerCase() } catch { return }

    pressedKeys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousemove", (e) => {
    mouse.x = (e.pageX + largerWindowDimension/2 - window.innerWidth/2)/canvas.width;
    mouse.y = (e.pageY + largerWindowDimension/2 - window.innerHeight/2)/canvas.height;
});

document.addEventListener("mousedown", () => mouse.down = true);
document.addEventListener("mouseup", () => mouse.down = false);

const interval = () => {
    clearCanvas(canvas);
    clearCanvas(minimap);

    canvasBackground.x = 0.5 - player.x;
    canvasBackground.y = 0.5 - player.y;
    canvasBackground.draw(canvas, largerWindowDimension);
    currentPage.draw(canvas, largerWindowDimension);

    minimapBackground.draw(minimap, largerWindowDimension/100);
    minimapComponents.forEach(c => {
        c.draw(minimap, largerWindowDimension/100);
    });

    currentPage.onInterval();
    requestAnimationFrame(interval);
}
interval();