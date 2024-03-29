import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let poly1;
let poly2;
let model;

let bounds = [];
let polygons = [];
let models = [];

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function render(dt) {
  for (let model of models) {
    model.render(ctx);
  }

  for (let polygon of polygons) {
    polygon.render(ctx);
  }

  let delta = poly2.pos.clone().add(poly2.toObjectSpace(poly1.pos));
  ctx.fillStyle = "rbg(0,0,255)";
  ctx.fillRect(delta.x, delta.y, 10, 10);

  // newPoly.render(ctx);
}

let gravity = new Vector2(0, 1000);
let substeps = 4;
function calculate(dt, t) {
  if (paused) {
    return;
  }

  // gravity.set(1000 * Math.cos(t), 1000 * Math.sin(t));

  poly2.rot += dt * ((10 * Math.PI) / 180);

  for (let model of models) {
    for (let i = 0; i < substeps; i++) {
      let dti = dt / substeps;
      model.vel.add(gravity.clone().scale(dti));
      model.tick(dti, t);

      for (let collPoly of polygons) {
        let results = model.testPolygonCollision(collPoly, ctx);

        results.forEach((result) => {
          if (result == false) {
            return;
          }
          model.resolvePolygonCollision(result.polygon, result.mvt, result.normal, result.points);
        });
      }
    }
  }

  for (let polygon of polygons) {
    for (let i = 0; i < substeps; i++) {
      let dti = dt / substeps;
      polygon.vel.add(gravity.clone().scale(dti));

      // model.vel.add(gravity.clone().scale(dti))
      polygon.tick(dti, t);

      for (let collPoly of polygons) {
        if (collPoly === polygon) {
          continue;
        }

        // if (!polygon.boundsCollide(collPoly)) {
        //   continue;
        // }

        let result = polygon.testCollision(collPoly, ctx);
        if (result == false) {
          continue;
        }
        polygon.resolveCollision(collPoly, result.mvt, result.normal, result.points);
      }
    }
  }
}

let time = 0;
function loop(t) {
  updateCanvasSize();
  clearCanvas(ctx);

  let dt = t / 1000 - time;

  if (mouse1down) {
    let delta = new Vector2(prevMouseEvent.clientX, prevMouseEvent.clientY).subtract(poly1.pos);
    poly1.pos.set(prevMouseEvent.clientX, prevMouseEvent.clientY);
    poly1.vel.set(delta.x * 25, delta.y * 25);
    // poly1.applyImpulse(delta.scale(poly1.mass / 2), poly1.pos)
  }

  calculate(dt, t / 1000);
  render(dt);

  time = t / 1000;
  window.requestAnimationFrame(loop);
}

function updateCanvasSize() {
  ctx.canvas.width = src.clientWidth;
  ctx.canvas.height = src.clientHeight;
}

let boundThickness = 1000;
function startup() {
  updateCanvasSize();

  let top = new polyModule.Box(new Vector2(ctx.canvas.width / 2, -boundThickness / 2), new Vector2(ctx.canvas.width + boundThickness * 2, boundThickness), 0, undefined, undefined);
  top.anchored = true;
  top.mass = 0;
  top.invMass = 0;
  top.i = 0;
  top.invI = 0;
  polygons.push(top);

  let bottom = new polyModule.Box(
    new Vector2(ctx.canvas.width / 2, ctx.canvas.height + boundThickness / 2),
    new Vector2(ctx.canvas.width + boundThickness * 2, boundThickness),
    0,
    undefined,
    undefined
  );
  bottom.anchored = true;
  bottom.mass = 0;
  bottom.invMass = 0;
  bottom.i = 0;
  bottom.invI = 0;
  polygons.push(bottom);

  let left = new polyModule.Box(new Vector2(-boundThickness / 2, ctx.canvas.height / 2), new Vector2(boundThickness, ctx.canvas.height + boundThickness * 2), 0, undefined, undefined);
  left.anchored = true;
  left.mass = 0;
  left.invMass = 0;
  left.i = 0;
  left.invI = 0;
  polygons.push(left);

  let right = new polyModule.Box(
    new Vector2(ctx.canvas.width + boundThickness / 2, ctx.canvas.height / 2),
    new Vector2(boundThickness, ctx.canvas.height + boundThickness * 2),
    0,
    undefined,
    undefined
  );
  right.anchored = true;
  right.mass = 0;
  right.invMass = 0;
  right.i = 0;
  right.invI = 0;
  polygons.push(right);

  // poly1 = new polyModule.Box(new Vector2(ctx.canvas.width / 2 , ctx.canvas.height / 2), new Vector2(300, 100), 65, undefined, -0)
  // polygons.push(poly1)

  poly1 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(200, 100), 30, 0, undefined, -20);
  // poly1.anchored = true

  polygons.push(poly1);

  poly2 = new polyModule.Box(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(500, 50), 5, undefined, 0);
  polygons.push(poly2);
  poly2.anchored = true;
  // poly2 = new polyModule.RegularPolygon(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), new Vector2(100, 150), 50, 0, undefined, 10)
  // poly2 = new polyModule.Wall(new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2), 500, 0, new Vector2(0, 0), 0)
  // polygons.push(poly2)
  for (let i = 0; i < 20; i++) {
    createNewRandomPolygon();
  }

  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(startup);

function createNewRandomPolygon() {
  polygons.push(
    new polyModule.RegularPolygon(
      new Vector2(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()),
      new Vector2(25 + Math.random() * 100, 25 + Math.random() * 100),
      3 + Math.floor(Math.random() * 3),
      0,
      undefined,
      180 * Math.random()
    )

    // new polyModule.Box(
    //   new Vector2(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()),
    //   new Vector2(25 + Math.random() * 100, 25 + Math.random() * 100),
    //   0,
    //   undefined,
    //   180 * Math.random()
    // )
  );
}

var prevMouseEvent = undefined;
document.addEventListener("mousemove", (event) => {
  prevMouseEvent = event;
});

var mouse1down = false;
var mouse2down = false;
document.addEventListener("mousedown", (event) => {
  if (event.buttons == 1) {
    mouse1down = true;
    return;
  } else if (event.buttons == 2) {
    mouse2down = true;
    return;
  }
});

document.addEventListener("mouseup", (event) => {
  if (mouse1down) {
    mouse1down = false;
    return;
  } else if (mouse2down) {
    mouse2down = false;
    return;
  }
});

let paused = false;
document.addEventListener("keypress", (event) => {
  if (event.key === " ") {
    paused = !paused;
  }
});
