import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let newPoly

let polygons = []

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function render(dt) {
    clearCanvas(ctx);
    for (let polygon of polygons) {
        polygon.render(ctx)
    }

    // newPoly.render(ctx);
}

function calculate(dt, t) {
    for (let polygon of polygons) {
        polygon.tick(dt, t)
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

    // newPoly = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 50), 0, undefined, 0)
    // polygons.push(newPoly)

    newPoly = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 50, 10, undefined, undefined, 0   )
    polygons.push(newPoly)

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