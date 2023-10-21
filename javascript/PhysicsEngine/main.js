import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let poly1
let poly2
let model

let bounds = []
let polygons = []
let models = []

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function render(dt) {

    model.render(ctx)

    for (let model of models) {
        model.render(ctx)
    }

    for (let polygon of polygons) {
        polygon.render(ctx)
    }

    // newPoly.render(ctx);
}

function applyCollisionBounds(polygon) {
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
}

function calculate(dt, t) {
    if (paused) { return }

    for (let model of models) {
        for (let i = 0; i < 4; i++) {
            let dti = dt / 4
            model.vel.y += 1000 * dt
            model.tick(dti, t)
            // if (!polygon.anchored) {
            //     // applyCollisionBounds(polygon)
            // }

            for (let collPoly of polygons) {
                let results = model.testPolygonCollision(collPoly, ctx)

                results.forEach(result => {
                    if (result == false) { return }
                    model.resolvePolygonCollision(result.polygon, result.mvt, result.normal, result.points)
                });
            }
        }
        // console.log(model)
    }

    for (let polygon of polygons) {
        for (let i = 0; i < 4; i++) {
            let dti = dt / 4

            polygon.vel.y += 1000 * dti
            polygon.tick(dti, t)

            if (!polygon.anchored) {
                // applyCollisionBounds(polygon)
            }

            for (let collPoly of polygons) {
                if (collPoly === polygon) { continue }
                let result = polygon.testCollision(collPoly, ctx)
                if (result == false) { continue }
                polygon.resolveCollision(collPoly, result.mvt, result.normal, result.points)
            }
        }

    }

    

}

let time = 0;
function loop(t) {
    updateCanvasSize();
    clearCanvas(ctx);

    let dt = (t / 1000) - time;

    if (mouse1down) {
        let delta = new Vector2(prevMouseEvent.clientX, prevMouseEvent.clientY).subtract(model.pos)
        // model.pos.set(prevMouseEvent.clientX, prevMouseEvent.clientY)
        model.applyImpulse(delta.scale(model.mTot / 2), model.pos)
    }

    calculate(dt, t / 1000);
    render(dt);

    time = (t / 1000);
    window.requestAnimationFrame(loop);
}

function updateCanvasSize() {
    ctx.canvas.width = src.clientWidth;
    ctx.canvas.height = src.clientHeight;
}

let boundThickness = 1000
function startup() {
    updateCanvasSize();

    let top = new polyModule.Box(new Vector2(ctx.canvas.width / 2, -boundThickness / 2), new Vector2(ctx.canvas.width + boundThickness * 2, boundThickness), 0, undefined, undefined)
    top.anchored = true
    polygons.push(top)

    let bottom = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height + boundThickness / 2), new Vector2(ctx.canvas.width + boundThickness * 2, boundThickness), 0, undefined, undefined)
    bottom.anchored = true
    polygons.push(bottom)

    let left = new polyModule.Box(new Vector2(-boundThickness / 2, ctx.canvas.height / 2), new Vector2(boundThickness, ctx.canvas.height + boundThickness * 2), 0, undefined, undefined)
    left.anchored = true
    polygons.push(left)

    let right = new polyModule.Box(new Vector2(ctx.canvas.width + boundThickness / 2, ctx.canvas.height / 2), new Vector2(boundThickness, ctx.canvas.height + boundThickness * 2), 0, undefined, undefined)
    right.anchored = true
    polygons.push(right)


    model = new polyModule.Model([
        new polyModule.Box(new Vector2(0, 0), new Vector2(100, 50), 0),
        new polyModule.Box(new Vector2(75, 0), new Vector2(50, 150), 0),
        new polyModule.Box(new Vector2(-75, 0), new Vector2(50, 150), 0)
    ], new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 0)
    console.log(model)
    models.push(model)

    poly1 = new polyModule.Box(new Vector2(ctx.canvas.width / 2 , ctx.canvas.height / 2), new Vector2(300, 100), 0, undefined, -0)
    polygons.push(poly1)

    // poly1 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 100), 30, 0, undefined, -20)
    // polygons.push(poly1)

    poly2 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height - 100), new Vector2(3000, 100), 5, undefined, 0)
    // polygons.push(poly2)
    poly2.anchored = true
    // poly2 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 150), 50, 0, undefined, 10)
    // poly2 = new polyModule.Wall(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 500, 0, new Vector2(0, 0), 0)
    polygons.push(poly2)
    
    // for (let i = 0; i < 25; i++) {
    //     polygons.push(
    //         new polyModule.RegularPolygon(
    //             new Vector2(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()),
    //             new Vector2(25 + Math.random() * 100, 25 + Math.random() * 100),
    //             3 + Math.floor(Math.random() * 3),
    //             0,
    //             undefined,
    //             180 * Math.random()
    //         )

    //         // new polyModule.Box(
    //         //     new Vector2(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()),
    //         //     new Vector2(25 + Math.random() * 100, 25 + Math.random() * 100),
    //         //     0,
    //         //     undefined,
    //         //     180 * Math.random(),
    //         // )
    //     )
    // }

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(startup);

var prevMouseEvent = undefined
document.addEventListener('mousemove', (event) => {
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
