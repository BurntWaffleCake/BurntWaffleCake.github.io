const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

var time = performance.now()

function clearCanvas() {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

class Ball {
    radius = 0;
    x = 0.0;
    y = 0.0;

    velX = 10.0;
    velY = 0.0;

    constructor(x, y, radius = 10) {
        console.log(x, y, radius)
        this.x = x
        this.y = y
        this.radius = radius
    }

    tick(dt) {
     
        console.log(this.x * 0.0166)
        // console.log(this.x + this.velX*dt, this.velY*dt)
        this.x = this.x + this.velX * dt
        this.y = this.y + this.velY * dt

        // console.log(this.x, this.y, dt)
    }

    render() {
        ctx.arc(this.x, this.y, 100, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fill()
    }

}

let ball;

function loop(t) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    let dt = (t / 1000) - time

    ball.tick(dt)

    clearCanvas()
    ball.render()


    time = t / 1000 //miliseconds to seconds
    window.requestAnimationFrame(loop)
}

function startup() {
    console.log("Starting")
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ball = new Ball(ctx.canvas.width / 2, ctx.canvas.height / 2, 10)

    loop()
}

startup()