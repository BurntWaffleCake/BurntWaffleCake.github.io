import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let newPoly = new polyModule.Polygon([
    new Vector2(-50, 50),
    new Vector2(50, 50),
    new Vector2(50, -50),
    new Vector2(-50, -50)
])


let vector = new Vector2(1, 1);
let vector2 = new Vector2(5, 3);

function render(dt) {
    newPoly.render(ctx);
}

function calculate(dt, t) {

}

let time = 0;
function loop(t) {
    let dt = (t/1000) - time;

    ctx.canvas.width = src.clientWidth;
    ctx.canvas.height = src.clientHeight;

    newPoly.pos.x = ctx.canvas.width / 2
    newPoly.pos.y = ctx.canvas.height / 2

    calculate(dt, t);
    render(dt);

    time += t / 1000;
    window.requestAnimationFrame(loop);
}

function startup() {
    loop();
}

startup();