const socket = io();

class Page {
    constructor (name, components, onInterval) {
        this.name = name;
        this.components = components;
        this.onInterval = onInterval;
    }
    draw (canvas) {
        try {
            this.components.forEach(c => c.draw(canvas));
        } catch (e) {
            console.error(e);
            console.log(c);
        }
    }
}

const canvas = document.querySelector("#canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
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
    pages["game"].components = players.map(p => new Circle(p.x, p.y, p.radius, "rgb(0, 0, 0)"));
    pages["game"].components.push(player);
});

document.addEventListener("click", (event) => {
    currentPage.components.forEach(component => {
        if (component.onClickEvent) component.onClickEvent(event, canvas);
    });
});

const pressedKeys = {};
const mouse = { x: 0, y: 0, down: false };

document.addEventListener("keydown", (e) => {
    try { e.key.toLowerCase() } catch { return }

    pressedKeys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    try { e.key.toLowerCase() } catch { return }

    pressedKeys[e.key.toLowerCase()] = false;
});

document.addEventListener("mousemove", (e) => {
    mouse.x = e.pageX/window.innerWidth;
    mouse.y = e.pageY/window.innerHeight;
});

document.addEventListener("mousedown", () => mouse.down = true);
document.addEventListener("mouseup", () => mouse.down = false);

const interval = () => {
    clearCanvas(canvas);
    currentPage.draw(canvas);
    currentPage.onInterval();
    requestAnimationFrame(interval);
}
interval();