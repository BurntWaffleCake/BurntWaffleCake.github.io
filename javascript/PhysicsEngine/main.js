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

    for (let polygon of polygons) {
        polygon.render(ctx)
    }

    // newPoly.render(ctx);
}

function calculate(dt, t) {
    if (paused) { return }

    poly1.applyImpulse(new Vector2(5000 * dt, 0), poly1.pos.clone().add(new Vector2(0, 0)))

    for (let polygon of polygons) {
        for (let i = 0; i < 2; i++) {
            let dti = dt / 2
            polygon.tick(dti, t)
            polygon.vel.y += 1000 * dti

            let width = ctx.canvas.width
            let height = ctx.canvas.height

            if (polygon.pos.x + polygon.radius > width) {
                polygon.pos.x = width - polygon.radius
                polygon.vel.x = -polygon.vel.x * polygon.e
            }

            if (polygon.pos.x - polygon.radius < 0) {
                polygon.pos.x = polygon.radius
                polygon.vel.x = -polygon.vel.x * polygon.e
            }

            if (polygon.pos.y + polygon.radius > height) {
                polygon.pos.y = height - polygon.radius
                polygon.vel.y = -polygon.vel.y * polygon.e
            }

            if (polygon.pos.y - polygon.radius < 0) {
                polygon.pos.y = polygon.radius
                polygon.vel.y = -polygon.vel.y * polygon.e
            }

            let result = poly1.bruteForceTestCollision(poly2, ctx)
            if (result == false) { continue }
            poly1.resolveCollision(poly2, result.mvt, result.normal, result.point)
        }

    }

}

let time = 0;
function loop(t) {
    updateCanvasSize();
    clearCanvas(ctx);

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

    // poly1 = new polyModule.Box(new Vector2(ctx.canvas.width / 2 , ctx.canvas.height / 2), new Vector2(300, 100), 65, undefined, -0)
    // polygons.push(poly1)

    poly1 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 100), 3, 0, undefined, -20)

    polygons.push(poly1)

    poly2 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(300, 100), 0, undefined, 0)
    // polygons.push(poly2)
    poly2.anchored = true
    // poly2 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 150), 50, 0, undefined, 10)
    // poly2 = new polyModule.Wall(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 500, 0, new Vector2(0, 0), 0)
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

var prevMouseEvent = undefined
document.addEventListener('mousemove', (event) => {
    if (!mouse1down) { return }
    poly1.pos.set(event.clientX, event.clientY)

    if (prevMouseEvent != undefined) {
        let delta = { x: event.clientX - prevMouseEvent.clientX, y: event.clientY - prevMouseEvent.clientY }

        poly1.vel.set(delta.x * 50, delta.y * 50)
    }

    prevMouseEvent = event
})

var mouse1down = false
var mouse2down = false
document.addEventListener('mousedown', (event) => {
    if (event.buttons == 1) { mouse1down = true; return }
    else if (event.buttons == 2) { mouse2down = true; return }

})

document.addEventListener('mouseup', (event) => {
    if (mouse1down) { mouse1down = false; return }
    else if (mouse2down) { mouse2down = false; return }
})

let paused = false
document.addEventListener('keypress', (event) => {
    if (event.key === " ") {
        paused = !paused
    }
})
