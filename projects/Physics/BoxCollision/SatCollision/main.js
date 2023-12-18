import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js";

let src = document.getElementById("source");
let ctx = src.getContext("2d");

let poly1 = new polyModule.Box(new Vector2(0, 0), new Vector2(50, 50), 10);
poly1.fillColor = "rgba(0,0,0,0)";
let poly2 = new polyModule.Box(new Vector2(0, 0), new Vector2(50, 50), 30);
poly2.fillColor = "rgba(0,0,0,0)";

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function render() {
  poly1.render(ctx);
  poly2.render(ctx);
}

function calculate() {
  if (mouse1Down) {
    poly1.pos.set(mousePos.x, mousePos.y);
  }

  let result = poly1.testCollision(poly2, ctx);
  if (result) {
    poly1.strokeColor = "rgb(255,0,0)";
    poly2.strokeColor = "rgb(255,0,0)";
  } else {
    poly1.strokeColor = "rgb(255,255,255)";
    poly2.strokeColor = "rgb(255,255,255)";
  }
}

function loop(t) {
  updateCanvasSize();

  calculate();

  clearCanvas(ctx);
  render();

  window.requestAnimationFrame(loop);
}

function updateCanvasSize() {
  ctx.canvas.width = src.clientWidth;
  ctx.canvas.height = src.clientHeight;
}

let boundThickness = 1000;
function startup() {
  updateCanvasSize();

  poly1.pos = new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2);
  poly2.pos = new Vector2(ctx.canvas.width / 2, ctx.canvas.height / 2);

  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(startup);

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

var mousePos = new Vector2(0, 0);
src.onmousemove = function (e) {
  let pos = getMousePos(src, e);
  mousePos.set(pos.x, pos.y);
};

var mouse1Down = false;
src.onmousedown = function (e) {
  if (e.buttons == 1) {
    mouse1Down = true;
  }
};
src.onmouseup = function (e) {
  mouse1Down = false;
};

const rectAWidthInput = document.getElementById("RectAWidth");
const rectAHeightInput = document.getElementById("RectAHeight");
const rectARotationInput = document.getElementById("RectARotation");

const rectBWidthInput = document.getElementById("RectBWidth");
const rectBHeightInput = document.getElementById("RectBHeight");
const rectBRotationInput = document.getElementById("RectBRotation");

rectAWidthInput.oninput = function (event) {
  console.log(poly1.rot);
  poly1 = new polyModule.Box(poly1.pos, new Vector2(rectAWidthInput.value, poly1.size.y), poly1.getRotDegrees());
  poly1.fillColor = "rgba(0,0,0,0)";
};
rectAHeightInput.oninput = function (event) {
  poly1 = new polyModule.Box(poly1.pos, new Vector2(poly1.size.x, rectAWidthInput.value), poly1.getRotDegrees());
  poly1.fillColor = "rgba(0,0,0,0)";
};
rectARotationInput.oninput = function (event) {
  poly1 = new polyModule.Box(poly1.pos, poly1.size, Number(rectARotationInput.value));
  poly1.fillColor = "rgba(0,0,0,0)";
};

rectBWidthInput.oninput = function (event) {
  console.log(poly1.rot);
  poly2 = new polyModule.Box(poly2.pos, new Vector2(rectBWidthInput.value, poly2.size.y), poly2.getRotDegrees());
  poly2.fillColor = "rgba(0,0,0,0)";
};
rectBHeightInput.oninput = function (event) {
  poly2 = new polyModule.Box(poly2.pos, new Vector2(poly2.size.x, rectBWidthInput.value), poly2.getRotDegrees());
  poly2.fillColor = "rgba(0,0,0,0)";
};
rectBRotationInput.oninput = function (event) {
  poly2 = new polyModule.Box(poly2.pos, poly2.size, Number(rectBRotationInput.value));
  poly2.fillColor = "rgba(0,0,0,0)";
};
