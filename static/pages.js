const socket = io();

const usernameButton = document.getElementById("username-button");
const usernameInput = document.getElementById("username-input");
const setUsernameButton = document.getElementById("set-username-button");
let mapSize = 1;

socket.on("mapSize", serverMapSize => {
    mapSize = serverMapSize;
});

usernameButton.style.zIndex = 1;
usernameButton.addEventListener("click", () => {
    $("#username-modal").modal("show");
});

const usernameInputFocus = () => {
    usernameInput.removeEventListener("focus", usernameInputFocus);
    usernameInput.addEventListener("blur", usernameInputBlur);
    
    usernameInput.addEventListener("keydown", usernameInputKeydown);
}

const usernameInputBlur = () => {
    usernameInput.removeEventListener("blur", usernameInputBlur);
    usernameInput.addEventListener("focus", usernameInputFocus);

    usernameInput.removeEventListener("keydown", usernameInputKeydown)
}

const usernameInputKeydown = (event) => {
    if (event.code == "Enter") {
        setUsername();
    }
}

const setUsername = () => {
    socket.emit("usernameChange", { username: usernameInput.value });
}

socket.on("usernameChangeResult", (result) => {
    console.log(result);
    
    if (result) { 
        usernameInput.value = "";
        $("#username-modal").modal("hide");
    } else {
        alert("Username is taken");
    }
});

usernameInput.addEventListener("focus", usernameInputFocus);

setUsernameButton.addEventListener("click", setUsername);

class Page {
    /**
     * 
     * @param {*} name 
     * @param {*} components 
     * @param {[String]} htmlElements An array of html selectors that will only appear when the page is selected
     */
    constructor (name, components, htmlElements) {
        this.name = name;
        this.components = components;
        this.htmlElements = htmlElements;
    }
    draw (canvas, scaleFactor) {
        try {
            // console.log(this.components.sort((a, b) => a.z - b.z) ? this.components.sort((a, b) => a.z - b.z).map(c => c.z): "");
            this.components.sort((a, b) => a.z - b.z).forEach(c => c.draw(canvas, scaleFactor));
        } catch (e) {
            console.error(e);
            // console.log(c);
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

const canvasBackground = new Grid(0, 0, -1000, 5, 5, "rgb(225, 225, 225)", false, 150);
const minimapBackground = new Rect(0, 0, -999, 10, 10, "rgb(200, 200, 200)", false);

const player = new Circle(0.5, 0.5, 100, 0.01, "rgb(125, 125, 125)");
let playerId = -1;

const pages = {
    main: new Page ("main", [
        new Button (0.5, 0.5, 1, 0.25, 0.25, "rgb(125, 125, 125)", true, () => {
            changePage("game");
        }),
        new TextComponent(0.5, 0.5, 2, "black", 0.03, "Arial", "Join Game", true),
        new Rect(0.5, 0.5, -100, canvas.width, canvas.height, "rgba(127, 127, 127, 0.5)", true)
    ], ["#sign-in", "#canvas-container"]),
    game: new Page ("game", [
        player
    ], ["#canvas-container"])
}

let currentPage; //= pages["main"];
changePage("main");
function clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function changePage(pageName) {
    // Add page change listeners here
    if (currentPage) {
        if (currentPage.htmlElements) currentPage.htmlElements.forEach(el => document.querySelector(el).classList.add("d-none"));
    }
    
    // Changing the page
    currentPage = pages[pageName];

    currentPage.htmlElements.forEach(el => document.querySelector(el).classList.remove("d-none"));
}

socket.on("id", (id) => {
    playerId = id;
});

socket.on("playerDied", (_) => {
    changePage("main");
});

let receiveStart;
let totalReceiveFrames = 0, receiveRate;
let preventRedraw = false;
socket.on("pelletsUpdate", pellets => {
    if (!receiveStart) receiveStart = Date.now();
    receiveRate = 1000 * totalReceiveFrames/(Date.now() - receiveStart);

    pages["game"].components = [];
    minimapComponents = [];
    totalReceiveFrames ++;
    preventRedraw = true;    
    
    const gameComponents = pages["game"].components;
    pellets.forEach(p => {
        const newX = p.x - player.x;
        const newY = p.y - player.y;

        minimapComponents.push(new GameCircle(newX + mapSize, newY + mapSize, 98, p.radius + 0.05, p.color, p.x, p.y));
        if (newX + 0.5 < 0 || newX  + 0.5 > 1 - p.radius || newY + 0.5 > 1 + p.radius || newY + 0.5< 0) return;
        gameComponents.push(new GameCircle(newX + 0.5, newY + 0.5, 98, p.radius, p.color, p.x, p.y));
    });
});

socket.on("playersUpdate", players => {
    // Finds the player with the same id as the client so that it can set the reference point to that player's x and y
    const thisPlayer = players.find(p => p.id == playerId);
    if (thisPlayer) {
        player.x = thisPlayer.x;
        player.y = thisPlayer.y;
        player.velocity = thisPlayer.velocity;
        player.radius = thisPlayer.radius;
    }

    // This is the same as Canvas.shapes I'm just using a weird data structure
    const gameComponents = pages["game"].components;

    players.forEach(p => {
        // Offsetting the player because of the viewpoint
        // Note that the x and y values are normalized to the screen size so 0.5 is halfway across the screen
        const newX = p.x - player.x;
        const newY = p.y - player.y;

        // Ignore the minimap thing
        minimapComponents.push(new Player(newX + mapSize, newY + mapSize, 99,  p.radius + 0.25, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha || 0.75})`, p.x, p.y, p.velocity, p.username, p.id));

        // Removing all the players that aren't on your screen for performance reasons
        if (newX + 0.5 < 0 || newX  + 0.5 > 1 - p.radius || newY + 0.5 > 1 + p.radius || newY + 0.5< 0) return;
        // Creating a new instance of the circle class and adding it to game components
        // (99 is the z value)
        gameComponents.push(new Player(newX + 0.5, newY + 0.5, 99, p.radius, `rgb(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha || 1})`, p.x, p.y, p.velocity, p.username, p.id));
    });
    // pages["game"].components.push(player);

    preventRedraw = false;
    if (currentPage.name == "game") {
        // Check movement checks if the player has moved their mouse which prevents the client from sending redundant info to the server.
        if (mouse.checkMovement()) socket.emit("playerUpdate", { angle: mouse.angle });
    } 
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
    mouse.moved = true;
});

document.addEventListener("mousedown", () => mouse.down = true);
document.addEventListener("mouseup", () => mouse.down = false);

let totalFrames = 0, refreshRate;
const start = Date.now();
const interval = () => {
    totalFrames ++;
    refreshRate = 1000 * totalFrames/(Date.now() - start);
    if (!preventRedraw) {
        console.log(currentPage.components);
        clearCanvas(canvas);
        clearCanvas(minimap);
        if (player && player.velocity) {
            if (mouse.moved) {
                const cartesian = Player.cartesian(mouse.angle, Player.polar(player.velocity.x, player.velocity.y).magnitude);
                player.velocity.x = cartesian.x;
                player.velocity.y = cartesian.y;
            }

            player.x += player.velocity.x;
            player.y += player.velocity.y;
            
            ["x", "y"].forEach((coordinate) => {
                if (player[coordinate] - player.radius < 0 ) {
                    // This teleports the player back within the bounds
                    player[coordinate] = player.radius;
                } else if (player[coordinate] + player.radius > mapSize) {
                    // This teleports the player back within the bounds
                    player[coordinate] = mapSize - player.radius;
                }
            });
        }
        
        currentPage.components.forEach(component => {
            if (component.velocity) {
                component.actualX += component.velocity.x;
                component.actualY += component.velocity.y;
            }

            // TODO: use prototypes and stuff to do this
            if (component.isGameComponent) {
                // Checks if the player is outside the bounds of the map
                ["x", "y"].forEach((coordinate) => {
                    if (component[coordinate] - component.radius < 0 ) {
                        // This teleports the player back within the bounds
                        component[coordinate] = component.radius;
                    } else if (component[coordinate] + component.radius > mapSize) {
                        // This teleports the player back within the bounds
                        component[coordinate] = mapSize - component.radius;
                    }
                });

                if (component.id === playerId) { 
                    component.actualX = player.x;
                    component.actualY = player.y;
                }
                component.updateCoordinates(player, 0.5);
            }
        });

        minimapComponents.forEach(component => {
            if (component.id === playerId) { 
                component.actualX = player.x;
                component.actualY = player.y;
            }

            if (component.velocity) {
                component.actualX += component.velocity.x;
                component.actualY += component.velocity.y;
            }

            // TODO: use prototypes and stuff to do this
            if (component.isGameComponent) {
                // Checks if the player is outside the bounds of the map
                ["actualX", "actualY"].forEach((coordinate) => {
                    if (component[coordinate] - component.radius < 0 ) {
                        // This teleports the player back within the bounds
                        component[coordinate] = component.radius;
                        
                        if (component.velocity) {
                            component.velocity.x = 0;
                            component.velocity.y = 0;
                        }
                    } else if (component[coordinate] + component.radius > mapSize) {
                        // This teleports the player back within the bounds
                        component[coordinate] = mapSize - component.radius;

                        if (component.velocity) {
                            component.velocity.x = 0;
                            component.velocity.y = 0;
                        }
                    }
                });

                component.updateCoordinates(player, mapSize);
            }
        });
        canvasBackground.x = 0.5 - player.x;
        canvasBackground.y = 0.5 - player.y;

        canvasBackground.draw(canvas, largerWindowDimension);
        currentPage.draw(canvas, largerWindowDimension);

        minimapBackground.draw(minimap, largerWindowDimension/100);
        minimapComponents.forEach(c => {
            c.draw(minimap, largerWindowDimension/100);
        });
    }
    requestAnimationFrame(interval);
}
interval();

socket.emit("positionUpdate", { x:1, y: 2 })