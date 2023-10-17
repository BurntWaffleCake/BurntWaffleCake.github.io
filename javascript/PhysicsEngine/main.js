import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let poly1
let poly2

let polygons = []

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function render(dt) {
    clearCanvas(ctx);

    let result = poly1.bruteForceTestCollision(poly2, ctx)
    console.log(poly1.pos)
    if (result == false) {
        poly2.strokeColor = "rgb(255,255,255)"
        poly1.strokeColor = "rgb(255,255,255)"
    } else {
        poly1.resolveCollision(poly2, result.mvt, result.normal, result.point)
        
        poly1.strokeColor = "rgb(255,0,0)"
        poly2.strokeColor = "rgb(255,0,0)"

        ctx.fillStyle = "rgb(255,255,255)"

        // console.log(result.normal.clone().scale(result.mvt/2))
        // poly1.pos.subtract(result.normal.clone().scale(result.mvt/2))
        // poly2.pos.add(result.normal.clone().scale(result.mvt/2))
    }

    for (let polygon of polygons) {
        polygon.render(ctx)
    }

    // newPoly.render(ctx);
}

function calculate(dt, t) {
    if (paused) {return}
    for (let polygon of polygons) {
        polygon.tick(dt, t)

        let width = ctx.canvas.width
        let height = ctx.canvas.height

        if (polygon.pos.x + polygon.radius > width) {
            polygon.pos.x = width - polygon.radius
            polygon.vel.x = -polygon.vel.x
        }

        if (polygon.pos.x - polygon.radius < 0) {
            polygon.pos.x = polygon.radius
            polygon.vel.x = -polygon.vel.x
        }

        if (polygon.pos.y + polygon.radius > height) {
            polygon.pos.y = height - polygon.radius
            polygon.vel.y = -polygon.vel.y
        }

        if (polygon.pos.y - polygon.radius < 0) {
            polygon.pos.y = polygon.radius
            polygon.vel.y = -polygon.vel.y
        }


    }
}

let time = 0;
function loop(t) {
    updateCanvasSize();

    let dt = (t / 1000) - time;

    calculate(dt, t / 1000);
    render(dt);

    time = (t / 1000);
    window.requestAnimationFrame(loop);
}

function updateCanvasSize() {
    ctx.canvas.width = src.clientWidth;
    ctx.canvas.height = src.clientHeight;
}

function startup() {
    updateCanvasSize();

    // poly1 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 50), 65, undefined, -60)
    // polygons.push(poly1)

    poly1 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 100), 10, 0, undefined, -20)
    polygons.push(poly1)

    poly2 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(500
        , 50), 0, undefined, 0)
    // polygons.push(poly2)

    // poly2 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(150, 150), 6, 0, undefined, 10)
    polygons.push(poly2)
    // for (let i = 0; i < 10; i++) {
    //     polygons.push(
    //         new polyModule.Box(
    //             new Vector2(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()),
    //             new Vector2(25 + Math.random() * 50, 25 + Math.random() * 50),
    //             0,
    //             undefined,
    //             180 * Math.random(),
    //         )
    //     )
    // }

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(startup);

document.addEventListener('mousemove', (event) => {
    poly1.pos.set(event.clientX, event.clientY)
})

let paused = false
document.addEventListener('keypress', (event) => {
    console.log(event)
    if (event.key === " ") {
        paused = !paused
    }
})
