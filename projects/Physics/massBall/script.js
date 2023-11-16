class Ball {
    constructor(x = ctx.canvas.width / 2, y = ctx.canvas.width / 2, dx = 0, dy = 0, color = "rgb(255, 0, 0)") {
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.color = color
        this.radius = ballRadius
    }

    render(ctx) {
        ctx.moveTo(this.x, this.y)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ballRadius, 0, 2 * Math.PI);
        ctx.fill();
    }

    testBounds() {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0.0) {
            if (this.x < this.radius) {
                this.x = this.radius
            } else {
                this.x = canvas.width - this.radius
            }
            this.dx = -this.dx * .9
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0.0) {
            if (this.y - this.radius < 0) {
                this.y = this.radius
            } else {
                this.y = canvas.height - this.radius
            }
            this.dy = -this.dy * .9
        }
    }
}

function renderGrid() {
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell.length > 0) {
                ctx.fillStyle = "rgb(255,255,255)"
            } else {
                ctx.fillStyle = "rgb(0, " + String(255 * y / gridResolution - 1) + ", " + String(255 * x / gridResolution - 1) + ")"
            }
            ctx.fillRect((x-1) * ballRadius * 2, (y-1) * ballRadius * 2, ballRadius * 2, ballRadius * 2)
        }
    }
}

function createGrid() {
    for (let x = 0; x < gridResolution + 2; x++) {
        grid.push([])
        for (let y = 0; y < gridResolution + 2; y++) {
            grid[x].push([])
        }
    }
}

function updateGrid() {
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            row[x] = []
        }
    }

    for (ball of balls) {
        let gridx = Math.floor(ball.x / (ballRadius * 2)) + 1
        let gridy = Math.floor(ball.y / (ballRadius * 2)) + 1
        let cell = grid[gridy][gridx]
        cell.push(ball)
    }
}

function collide(ball1, ball2) {
    let distance = Math.sqrt((ball1.x - ball2.x) ** 2 + (ball1.y - ball2.y) ** 2)
    return (ball1.radius + ball2.radius) > distance
}

function resolveCollision(ball1, ball2) {
    let distance = Math.sqrt((ball1.x - ball2.x) ** 2 + (ball1.y - ball2.y) ** 2)
    let normX = (ball2.x - ball1.x) / distance
    let normY = (ball2.y - ball1.y) / distance

    let overlap = (ball1.radius + ball2.radius) - distance

    ball1.x -= overlap / 2 * normX
    ball1.y -= overlap / 2 * normY

    ball2.x += overlap / 2 * normX
    ball2.y += overlap / 2 * normY

    let relVelx = ball2.dx - ball1.dx
    let relVely = ball2.dy - ball1.dy

    let velNorm = normX * relVelx + normY * relVely
    if (velNorm > 0)
        return;

    var j = -(1 + restitution) * velNorm
    let inverseMassSum = (1 / ball1.radius + 1 / ball2.radius)
    j = j / inverseMassSum

    ball1.dx -= normX * j / ball1.radius
    ball1.dy -= normY * j / ball1.radius
    ball2.dx += normX * j / ball2.radius
    ball2.dy += normY * j / ball2.radius
}

function checkCellCollision(cell1, cell2) {
    for (ball1 of cell1) {
        for (ball2 of cell2) {
            if (ball1 === ball2) { continue }
            if (collide(ball1, ball2)) {
                resolveCollision(ball1, ball2)
            }
        }
    }
}

function collideGrid() {
    for (let x = 1; x < gridResolution + 1; x++) {
        for (let y = 1; y < gridResolution + 1; y++) {
            let currentCell = grid[y][x]
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let otherCell = grid[y + dy][x + dx]
                    checkCellCollision(currentCell, otherCell)
                }
            }
        }
    }
}

function updatePhysics(dt) {
    for (ball of balls) {
        ball.x = ball.x + ball.dx * dt
        ball.y = ball.y + ball.dy * dt
    }

    collideGrid()
    
    if (gridOn) {
        renderGrid()
    }

    for (ball of balls) {
        ball.testBounds()
        ball.dy += gravity * dt
        ball.dx += whatFactor * dt
    }
}

function updatePhysicsSubSteps(dt) {
    for (let i = 0; i < substeps; i++) {
        updatePhysics(dt / substeps)
    }

    for (ball of balls) {
        ball.render(ctx)
    }
}

const fpsCounter = document.getElementById("simulation-fps")
const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

function clearCanvas() {
    ctx.fillStyle = "rgb(0, 0, 0)"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

var reseting = false

var constantTime = true
var gravity = 5000
var whatFactor = 0
var restitution = .5
var substeps = 8
var ballRadius = 50
var gridResolution = 35
var gridOn = false

let balls = []
let grid = []

var time = null

function loop(t) {
    if (reseting) {
        reseting = false
        return
    }
    let framedt = Math.max(0, (t / 1000) - time)

    fpsCounter.textContent = `FPS: ${Math.round(1 / framedt)}`

    if (mouse1Down && mouse1InCanvas) {
        var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        balls.push(new Ball(
            mouse1x,
            mouse1y,
            Math.random() * 1000 - 500,
            Math.random() * 1000 - 500,
            randomColor
        )
        )
    }

    clearCanvas()
    
    let dt
    if (constantTime) {
        dt = 1 / 60
    } else {
        dt = framedt
    }

    updateGrid()
    updatePhysicsSubSteps(dt)

    time = t / 1000

    window.requestAnimationFrame(loop)
}

function cleanup() {
    reseting = true
    balls = []
    grid = []
}

function startup() {
    console.log("Starting")

    ctx.canvas.width = ballRadius * 2 * gridResolution
    ctx.canvas.height = ballRadius * 2 * gridResolution

    createGrid()

    for (let i = 0; i < 100; i++) {
        var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        balls.push(new Ball(
            ballRadius + Math.random() * (ctx.canvas.width - ballRadius),
            ballRadius + Math.random() * (ctx.canvas.height - ballRadius),
            Math.random() * 1000 - 500,
            Math.random() * 1000 - 500,
            randomColor
        )
        )
    }
    window.requestAnimationFrame(loop)
}

const gravityInput = document.getElementById("simulation-gravity")
gravityInput.addEventListener('input', (event) => {
    let inputNum = parseInt(gravityInput.value)
    if (isNaN(inputNum)) { gravity = 0 } else { gravity = inputNum }
}, false)

const whatFactorInput = document.getElementById("simulation-what-factor")
whatFactorInput.addEventListener('input', (event) => {
    let inputNum = parseInt(whatFactorInput.value)
    if (isNaN(inputNum)) { whatFactor = 0 } else { whatFactor = inputNum }
}, false)

const restitutionInput = document.getElementById("simulation-restitution")
restitutionInput.addEventListener('input', (event) => {
    let inputNum = parseInt(restitutionInput.value)
    if (isNaN(inputNum)) { restitution = 0 } else { restitution = inputNum }
}, false)

const simulationSubSteps = document.getElementById("simulation-substeps")
simulationSubSteps.addEventListener('input', (event) => {
    let inputNum = parseInt(simulationSubSteps.value)
    if (isNaN(inputNum)) { substeps = 0 } else { substeps = inputNum }
}, false)

renderGridButton = document.getElementById("simulation-render-grid")
renderGridButton.addEventListener('click', (event) => {
    gridOn = renderGridButton.checked
}, false)

constantTimeButton = document.getElementById("simulation-constant-time")
constantTimeButton.addEventListener('click', (event) => {
    constantTime = constantTimeButton.checked
}, false)

const clearButton = document.getElementById("simulation-clear")
clearButton.addEventListener('click', (event) => {
    console.log("reset clicked")
    balls = []
}, false)

const resetButton = document.getElementById("simulation-reset")
resetButton.addEventListener('click', (event) => {
    console.log("reset clicked")
    cleanup()
    startup()
}, false)

var mouse1Down = false
var mouse1x = 0.0
var mouse1y = 0.0
var mouse1InCanvas = false

document.addEventListener('mouseup', (event) => {
    if (event.buttons == 0) {
        mouse1Down = false
    }
}, false);

document.addEventListener('mousedown', (event) => {
    if (event.buttons == 1) {
        mouse1Down = true
    }
}, false);

document.addEventListener('mousemove', (evt) => {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    if (evt.clientX - rect.left < 0 || evt.clientX - rect.left > rect.width || evt.clientY - rect.top < 0 || evt.clientY - rect.top > rect.height) {
        mouse1InCanvas = false
    } else {
        mouse1InCanvas = true
    }

    mouse1x = (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    mouse1y = (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
}, false);

document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    if (code == "Space") {
        event.preventDefault()
        console.log("space pressed")

        for (ball of balls) {
            ball.dx = ball.dx + Math.random() * 5000 - 2500
            ball.dy = ball.dy + Math.random() * -5000
        }
    }
}, false);

window.addEventListener('load', function () {
    startup()
})


