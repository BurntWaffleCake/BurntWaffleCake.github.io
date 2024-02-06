function getOverlap(amin, amax, bmin, bmax) {
  return Math.max(0, Math.min(amax, bmax) - Math.max(amin, bmin));
}

function renderLine(ctx, fromx, fromy, tox, toy, color = "rgb(255,255,255)", lineWidth = 3) {
  ctx.save();

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.stroke();

  ctx.restore();
}

function renderAABBMarkers(rect, xColor = "rgb(255,0,0)", yColor = "rgb(0,255,255)") {
  renderLine(ctx, 0, rect.y, markerLength, rect.y, yColor);
  renderLine(ctx, 0, rect.y + rect.height, markerLength, rect.y + rect.height, yColor);

  renderLine(ctx, rect.x, 0, rect.x, markerLength, xColor);
  renderLine(ctx, rect.x + rect.width, 0, rect.x + rect.width, markerLength, xColor);
}

class Rectangle {
  constructor(x = 0, y = 0, width = 10, height = 10, fillColor = "rgb(255,255,255)", strokeColor = "rgb(255,255,255)") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.fillColor = fillColor;
    this.strokeColor = strokeColor;

    console.log(this);
  }

  render(ctx) {
    ctx.lineWidth = 3;
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    // ctx.stroke();
  }

  testAABB(to) {
    let xOverlap = getOverlap(this.x, this.x + this.width, to.x, to.x + to.width);
    let yOverlap = getOverlap(this.y, this.y + this.height, to.y, to.y + to.height);

    console.log(xOverlap, yOverlap, this.height);

    return xOverlap > 0 && yOverlap > 0 ? true : false;
  }
}

const rectA = new Rectangle(undefined, undefined, 200, 200, "rgb(0,0,0)");
const rectB = new Rectangle(undefined, undefined, 200, 200, "rgb(0,0,0)");

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

let t = 0; //time in seconds
function loop(time) {
  // time in milliseconds
  let dt = time / 1000 - t;
  t = time / 1000;

  updateCanvasSize();
  calculate(dt);
  render(dt);

  window.requestAnimationFrame(loop);
}

function updateCanvasSize() {
  ctx.canvas.width = canvas.clientWidth;
  ctx.canvas.height = canvas.clientHeight;
}

function init() {
  updateCanvasSize();
  rectA.x = ctx.canvas.width / 2 - rectA.width / 2;
  rectA.y = ctx.canvas.height / 2 - rectA.height / 2;

  rectA.width = ctx.canvas.width / 4;
  rectA.height = ctx.canvas.height / 4;

  rectB.x = ctx.canvas.width / 2 - rectB.width / 2;
  rectB.y = ctx.canvas.height / 2 - rectB.height / 2;

  rectB.width = ctx.canvas.width / 4;
  rectB.height = ctx.canvas.height / 4;

  window.requestAnimationFrame(loop);
}

const markerLength = 20;
function render(dt) {
  //render rectangles
  rectA.render(ctx);
  rectB.render(ctx);

  //render AABB debug markers
  renderAABBMarkers(rectA, "rgb(255,0,0)", "rgb(0,255,255)");
  renderAABBMarkers(rectB, "rgb(0,255,255)", "rgb(255,0,0)");
}

function toCanvasSpace(canvas, x, y) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(x - rect.left),
    y: Math.floor(y - rect.top),
  };
}
function calculate(dt) {
  if (mousedown) {
    let coords = toCanvasSpace(canvas, mousex, mousey);
    rectA.x = coords.x - rectA.width / 2;
    rectA.y = coords.y - rectA.height / 2;

    if (rectA.testAABB(rectB)) {
      rectA.strokeColor = "rgb(255,0,0)";
      rectB.strokeColor = "rgb(255,0,0)";
    } else {
      rectA.strokeColor = "rgb(255,255,255)";
      rectB.strokeColor = "rgb(255,255,255)";
    }
  }

  rectB.x = ctx.canvas.width / 2 - rectB.width / 2;
  rectB.y = ctx.canvas.height / 2 - rectB.height / 2;
}

init();

//input handling
var mousex = 0;
var mousey = 0;
canvas.onmousemove = function (event) {
  mousex = event.clientX;
  mousey = event.clientY;
};

var mousedown = false;
canvas.onmousedown = function (event) {
  if (event.buttons !== 1) {
    return;
  }
  mousedown = true;
};

canvas.onmouseup = function (event) {
  mousedown = false;
};

const rectAWidthInput = document.getElementById("RectAWidth");
const rectAHeightInput = document.getElementById("RectAHeight");
const rectBWidthInput = document.getElementById("RectBWidth");
const rectBHeightInput = document.getElementById("RectBHeight");

rectAWidthInput.oninput = function (event) {
  rectA.width = Number(rectAWidthInput.value);
};
rectAHeightInput.oninput = function (event) {
  rectA.height = Number(rectAHeightInput.value);
};

rectBWidthInput.oninput = function (event) {
  rectB.width = Number(rectBWidthInput.value);
};
rectBHeightInput.oninput = function (event) {
  rectB.height = Number(rectBHeightInput.value);
};
