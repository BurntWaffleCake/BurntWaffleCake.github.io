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

    let result = poly1.testCollision(poly2)
    if (result == false) {
        poly2.strokeColor = "rgb(255,255,255)"
        poly1.strokeColor = "rgb(255,255,255)"
    } else {
        poly1.strokeColor = "rgb(255,0,0)"
        poly2.strokeColor = "rgb(255,0,0)"
        let poly1Face = poly1.toWorldSpace(result.self.center())
        console.log(poly1Face)
        ctx.fillStyle = "rgb(255,255,255)"
        ctx.strokeRect(poly1Face.x, poly1Face.y, 10, 10)

        let axis = result.self.normal
        let proj1 = poly1.projectToAxis(axis)
        let proj2 = poly2.projectToAxis(axis)
        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fillRect(ctx.canvas.width / 2 + axis.y * proj1.minMag / 2 - 2.5, 0, 5, 5)
        ctx.fillRect(ctx.canvas.width / 2 + axis.y * proj1.maxMag / 2 - 2.5, 0, 5, 5)

        ctx.fillStyle = "rgb(255, 255, 0)"
        ctx.fillRect(ctx.canvas.width / 2 + axis.y * proj2.minMag / 2 - 2.5, 0, 5, 5)
        ctx.fillRect(ctx.canvas.width / 2 + axis.y * proj2.maxMag / 2 - 2.5, 0, 5, 5)

    }

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

    poly1 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 50), 0, undefined, 10)
    polygons.push(poly1)

    poly2 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 150), 0, undefined, 0)
    polygons.push(poly2)

    // poly2 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 50, 8, undefined, undefined, 0   )
    // polygons.push(poly2)
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