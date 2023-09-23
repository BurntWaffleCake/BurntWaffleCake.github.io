const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

var time = null

const gravity = 100

function clearCanvas() {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

let balls = [
]

class Ball {
    constructor(x, y, dx = 0.0, dy = 0.0, radius = 10, color = "rbg(255,0,0)") {
        console.log(x, y, radius)
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.r = radius
        this.e = 0//elasticity
        this.f = 1 //friction
        this.color = color
    }

    tick(dt) {
        this.dx = this.dx
        this.dy = this.dy + gravity

        this.x = this.x + this.dx * dt
        this.y = this.y + this.dy * dt

        if (this.x + this.r > canvas.width || this.x - this.r < 0.0) {
            if (this.x < this.r) {
                this.x = this.r
            } else {
                this.x = canvas.width - this.r
            }
            this.dx = -this.dx * this.e
        }
        if (this.y + this.r > canvas.height || this.y - this.r < 0.0) {
            if (this.y - this.r < 0) {
                this.y = this.r
            } else {
                this.y = canvas.height - this.r
            }

            this.dy = -this.dy * this.e
            this.dx = this.dx * this.f
        }

        if (Math.abs(this.dx) <= 0.1) {
            this.dx = 0
        }
        if (Math.abs(this.dy) <= 0.1) {
            this.dy = 0
        }

        this.render()
    }

    render() {
        ctx.moveTo(this.x, this.y)
        ctx.fillStyle = this.color

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }

}

let ball;

function testCollision(ball1, ball2) {
    let vecX = ball1.x - ball2.x
    let vecY = ball1.y - ball2.y
    let distance = Math.sqrt(vecX**2 + vecY**2)
    if (distance > ball1.r + ball2.r) { return }
    console.log("collided")
    let mtdx = vecX * ((ball1.r + ball2.r - distance) / distance)
    let mtdy = vecY * ((ball1.r + ball2.r - distance) / distance)

    ball1.x += mtdx
    ball1.y += mtdy

    ball2.x -= mtdx
    ball2.y -= mtdy

    let normVecX = vecX / distance
    let normVecY = vecY / distance

    let ball1dm = Math.sqrt(ball1.dx**2 + ball2.dy**2)
    ball1.dx = ball1dm * normVecX * ball1.e
    ball1.dy = ball1dm * normVecY * ball1.e

    let ball2dm = Math.sqrt(ball2.dx**2 + ball2.dy**2)
    ball2.dx = ball2dm * -normVecX * ball2.e
    ball2.dy = ball2dm * -normVecY * ball2.e
}

function loop(t) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    clearCanvas()

    let dt = Math.max(0, (t / 1000) - time)

    for (var ball of balls) {
        ball.tick(dt)

        for (var ball2 of balls) {
            if (ball == ball2) { continue }
            testCollision(ball, ball2)
        }
    }

    time = t / 1000 //miliseconds to seconds
    window.requestAnimationFrame(loop)
}

function startup() {
    console.log("Starting")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    for (let i = 0; i < 50; i++) {
        var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        balls.push(
            new Ball(
                50 + (window.innerWidth - 100) * Math.random(),
                50 + (window.innerHeight - 100) * Math.random(),
                Math.random() * 1000 - 500,
                Math.random() * 1000 - 500,
                35 * Math.random() + 50,
                randomColor
            )
        )
    }

    console.log(balls)

    window.requestAnimationFrame(loop)
}

startup()