class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.magnitude = Math.sqrt(x * x + y * y)
    }

    unit() {
        return new Vector2(this.x / this.magnitude, this.y / this.magnitude)
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y)
    }

    sub(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }

    mul(vector) {
        return new Vector2(this.x * vector.x, this.y * vector.y)
    }

    div(vector) {
        return new Vector2(this.x / vector.x, this.y / this.y)
    }

    scale(magnitude) {
        return new Vector2(this.x * magnitude, this.y * magnitude)
    }

    clone() {
        return new Vector2(this.x, this.y)
    }
}

class Ball {
    constructor(radius, pos = new Vector2(0, 0), vel = new Vector2(0, 0), color = "rbg(255,0,0)") {
        this.radius = radius
        this.mass = Math.PI * radius * radius

        this.pos = pos
        this.vel = vel

        this.color = color
    }

    setVel(newVel) {
        this.vel = newVel
    }

    setPos(newPos) {
        this.pos = newPos
    }

    testBounds() {
        if (this.pos.x + this.radius > canvas.width || this.pos.x - this.radius < 0.0) {
            if (this.pos.x < this.radius) {
                this.pos.x = this.radius
            } else {
                this.pos.x = canvas.width - this.radius
            }
            this.vel.x = -this.vel.x * restitution
        }
        if (this.pos.y + this.radius > canvas.height || this.pos.y - this.radius < 0.0) {
            if (this.pos.y - this.radius < 0) {
                this.pos.y = this.radius
            } else {
                this.pos.y = canvas.height - this.radius
            }

            this.vel.y = -this.vel.y * restitution
        }
    }

    updatePos(dt) {
        this.pos = this.pos.add(this.vel.scale(dt))
    }

    accelerate(dt, acceleration) {
        this.vel = this.vel.add(acceleration.scale(dt))
    }

    render(ctx) {
        ctx.moveTo(this.pos.x, this.pos.y)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

function clearCanvas() {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

var time = null
const gravity = new Vector2(0, 1000)
let balls = []
let restitution = 0
let substeps = 1

function testCollisions() {
    for (ball1 of balls) {
        for (ball2 of balls) {
            if (ball1 === ball2) { continue }
            testCollision(ball1, ball2)

        }
    }
}

function testCollision(ball1, ball2) {
    let delta = ball2.pos.sub(ball1.pos)
    let distance = delta.magnitude
    if (distance > ball1.radius + ball2.radius) { return } //balls not colliding
    let overlap = (ball1.radius + ball2.radius) - distance
    let relVel = ball2.vel.sub(ball1.vel)
    let normal = delta.unit()
    
    ball1.pos = ball1.pos.sub(normal.scale(overlap / 2))
    ball2.pos = ball2.pos.add(normal.scale(overlap / 2))

    let velAlongNorm = normal.dot(relVel)

    if (velAlongNorm > 0)
        return;

    var j = -(1 + restitution) * velAlongNorm
    let inverseMassSum = (1 / ball1.mass + 1 / ball2.mass)
    j = j / inverseMassSum
    
    ball1.vel = ball1.vel.sub(normal.scale(j / ball1.mass))
    ball2.vel = ball2.vel.add(normal.scale(j / ball2.mass))
}

function newBall(position = new Vector2(canvas.width - 2 * radius, canvas.height - 2 * radius)) {
    let radius = 35 * Math.random() + 10
    let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    return new Ball(
        radius,
        position,
        new Vector2(Math.random() * 1000 - 500, Math.random() * 1000 - 500),
        randomColor
    )
}

function loop(t) {
    if (mouse1Down == true) {
        var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        balls.push(
            newBall(new Vector2(mouse1x, mouse1y))
        )
    }

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    clearCanvas()

    let dt = Math.max(0, (t / 1000) - time)

    for (let i = 0; i < substeps; i++) {
        let subdt = dt / substeps
        for (ball of balls) {
            ball.updatePos(subdt);
    
            ball.accelerate(subdt, gravity);
            ball.testBounds();
    
            testCollisions()
        }
    }

    for (ball of balls) {
        ball.render(ctx)
    }

    time = t / 1000 //miliseconds to seconds
    window.requestAnimationFrame(loop)
}

function startup() {
    console.log("Starting")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    for (let i = 0; i < 0; i++) {
        balls.push(
            newBall()
        )
    }

    window.requestAnimationFrame(loop)
}

var mouse1Down = false
var mouse1x = 0.0
var mouse1y = 0.0

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

document.addEventListener('mousemove', (event) => {
    mouse1x = event.clientX
    mouse1y = event.clientY
}, false);


document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    if (code == "Space") {
        console.log("space pressed")

        for (ball of balls) {
            ball.dx = ball.dx + Math.random() * 5000 - 2500
            ball.dy = ball.dy + Math.random() * -5000

        }
    }
}, false);

startup()

