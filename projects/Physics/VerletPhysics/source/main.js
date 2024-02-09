import { Link, Node } from "./Collections.js";

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");

function updateCanvasSize() {
  ctx.canvas.width = canvas.clientWidth;
  ctx.canvas.height = canvas.clientHeight;
}
updateCanvasSize();

let t = 0; //time in seconds
function loop(time) {
  // time in milliseconds
  let dt = time / 1000 - t;
  t = time / 1000;
  updateCanvasSize();

  if (minNode) {
    if (!shiftDown) {
      let dx = mousepos.x - minNode.pos.x;
      let dy = mousepos.y - minNode.pos.y;

      minNode.pos.x += 2 * dx * dt;
      minNode.pos.y += 2 * dy * dt;
    } else {
      minNode.pos.x = mousepos.x;
      minNode.pos.y = mousepos.y;
    }
  }

  calculate(dt);

  render(dt);

  window.requestAnimationFrame(loop);
}
function init() {
  window.requestAnimationFrame(loop);
}

let links = [];
let nodes = [];
function render(dt) {
  for (let node of nodes) {
    node.render(ctx);
  }

  for (let link of links) {
    link.render(ctx);
  }

  for (let constraint of circleConstraints) {
    ctx.beginPath();
    ctx.arc(constraint.x, constraint.y, constraint.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgb(0,0,0)";
    // ctx.fillStyle = "rgb(0,0,0)";
    // ctx.fill();
    ctx.stroke();
  }

  if (minNode) {
    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.beginPath();
    ctx.moveTo(mousepos.x, mousepos.y);
    ctx.lineTo(minNode.pos.x, minNode.pos.y);
    ctx.stroke();
  }
}

function generateBox(x, y, width, height, radius, stiffness) {
  let node = new Node(radius, x, y, 0, 0);
  let node2 = new Node(radius, x + width, y, 0, 0);
  let node3 = new Node(radius, x + width, y + height, 0, 0);
  let node4 = new Node(radius, x, y + height, 0, 0);

  let link = new Link(node, node2, width, stiffness);
  let link2 = new Link(node2, node3, height, stiffness);
  let link3 = new Link(node3, node4, width, stiffness);
  let link4 = new Link(node4, node, height, stiffness);

  let link5 = new Link(node, node3, Math.sqrt(width ** 2 + height ** 2), stiffness);
  let link6 = new Link(node2, node4, Math.sqrt(width ** 2 + height ** 2), stiffness);

  links.push(link, link2, link3, link4, link5, link6);
  nodes.push(node, node2, node3, node4);
  console.log(node, node2, node3, node4);
}

generateBox(ctx.canvas.width / 2, ctx.canvas.height / 2, 150, 150, 5);

function generateRope(x, y, length, spacing) {
  let ropeNodes = [];
  for (let i = 0; i < length; i++) {
    let node = new Node(5, x + i * spacing, y);
    nodes.push(node);
    ropeNodes.push(node);
  }

  for (let i = 0; i < ropeNodes.length - 1; i++) {
    links.push(new Link(ropeNodes[i], ropeNodes[i + 1], spacing, 2));
  }
}

generateRope(ctx.canvas.width / 2, ctx.canvas.height / 2, 5, 50);

function generateGrid(type, x, y, width, height, spacing = 10, radius = 1, stiffness) {
  let grid = [];
  for (let sy = 0; sy < height; sy++) {
    let row = [];
    for (let sx = 0; sx < width; sx++) {
      let node = new Node(radius, x + sx * spacing, y + sy * spacing);
      node.selectable = false;
      nodes.push(node);
      row.push(node);
    }
    grid.push(row);
  }

  for (let sy = 0; sy < grid.length - 1; sy++) {
    let row = grid[sy];
    let nextRow = grid[sy + 1];
    for (let sx = 0; sx < row.length - 1; sx++) {
      links.push(new Link(row[sx], row[sx + 1], spacing, stiffness));
      links.push(new Link(row[sx], nextRow[sx], spacing, stiffness));
    }
    links.push(new Link(row[row.length - 1], nextRow[nextRow.length - 1], spacing));
  }

  let lastRow = grid[grid.length - 1];
  for (let sx = 0; sx < lastRow.length - 1; sx++) {
    links.push(new Link(lastRow[sx], lastRow[sx + 1], spacing, stiffness));
  }

  switch (type) {
    case "corner-spaced":
      grid[0].forEach((element, index) => {
        if (index % 10 == 0) {
          element.pinned = true;
          element.radius = 5;
          element.selectable = true;
        }
      });

      grid[grid.length - 1].forEach((element, index) => {
        if (index % 10 == 0) {
          element.pinned = true;
          element.radius = 5;
          element.selectable = true;
        }
      });

      grid.forEach((element, index) => {
        if (index % 10 == 0) {
          element[0].pinned = true;
          element[0].radius = 5;
          element[0].selectable = true;
        }
      });

      grid.forEach((element, index) => {
        if (index % 10 == 0) {
          element[element.length - 1].pinned = true;
          element[element.length - 1].radius = 5;
          element[element.length - 1].selectable = true;
        }
      });

      grid[grid.length - 1][grid[0].length - 1].pinned = true;
      grid[grid.length - 1][grid[0].length - 1].radius = 5;
      grid[grid.length - 1][grid[0].length - 1].selectable = true;

      break;
    case "corner":
      grid[0][0].pinned = true;
      grid[0][grid[0].length - 1].pinned = true;
      grid[grid.length - 1][0].pinned = true;
      grid[grid.length - 1][grid[0].length - 1].pinned = true;

      grid[0][0].selectable = true;
      grid[0][grid[0].length - 1].selectable = true;
      grid[grid.length - 1][0].selectable = true;
      grid[grid.length - 1][grid[0].length - 1].selectable = true;
      break;

    case "spaced":
      grid[0].forEach((element, index) => {
        if (index % 10 == 0) {
          element.pinned = true;
          element.selectable = true;
        }
      });

      grid[0][0].pinned = true;
      grid[0][grid[0].length - 1].pinned = true;

      grid[0][0].selectable = true;
      grid[0][grid[0].length - 1].selectable = true;
      break;

    default:
      grid[0].forEach((element, index) => {
        element.pinned = true;
        element.selectable = true;
      });
      break;
  }
}

let circleConstraints = [];
function addCircleConstraint(x, y, radius) {
  circleConstraints.push({ x: x, y: y, radius: radius });
}

addCircleConstraint(ctx.canvas.width / 2 - 100, ctx.canvas.height / 2, 100);

generateGrid("corner-spaced", ctx.canvas.width / 2, ctx.canvas.height / 2, 30, 30, 10, 1, 1.5);
var gravity = 9.8;
var wind = 0.0;
function calculate(dt) {
  for (let node of nodes) {
    node.tick(dt, ctx);
    if (!node.pinned) {
      node.pos.y += gravity * dt;
      node.pos.x += wind * dt;
    }
    node.constrain(ctx.canvas.width, ctx.canvas.height);

    for (const constraint of circleConstraints) {
      let dx = node.pos.x - constraint.x;
      let dy = node.pos.y - constraint.y;
      let dis = Math.sqrt(dx ** 2 + dy ** 2);
      if (node.radius + constraint.radius <= dis) {
        continue;
      }

      node.pos.x = constraint.x + (dx / dis) * (node.radius + constraint.radius);
      node.pos.y = constraint.y + (dy / dis) * (node.radius + constraint.radius);
    }
  }

  for (let link of links) {
    link.tick(dt, ctx);
  }
}

init();

const optionsBody = document.getElementById("options-body");
const optionsButton = document.getElementById("options-toggle");
let optionsOpen = false;
optionsButton.onclick = function (event) {
  optionsOpen = !optionsOpen;
  if (optionsOpen) {
    optionsBody.style.display = "flex";
  } else {
    optionsBody.style.display = "none";
  }
};

let mousepos = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
let mousedown = false;
let mousetype = 0;
let shiftDown = false;
canvas.addEventListener("mousemove", (event) => {
  mousepos.x = event.clientX;
  mousepos.y = event.clientY;
});

let minNode = undefined;
canvas.addEventListener("mousedown", (event) => {
  mousedown = true;

  mousetype = event.buttons;

  let minDis = Number.MAX_SAFE_INTEGER;
  for (let node of nodes) {
    if (!node.selectable && event.buttons == 2) {
      continue;
    }
    let dx = mousepos.x - node.pos.x;
    let dy = mousepos.y - node.pos.y;
    let dis = Math.sqrt(dx * dx + dy * dy);
    if (dis < minDis) {
      minNode = node;
      minDis = dis;
    }
  }
});

canvas.addEventListener("mouseup", (event) => {
  minNode = undefined;
  mousedown = false;
});

canvas.oncontextmenu = function () {
  return false;
};

document.onkeydown = function (event) {
  if (event.key == " " && minNode) {
    minNode.pinned = !minNode.pinned;
  } else if (event.key == "Shift") {
    shiftDown = true;
  }
};

document.onkeyup = function (event) {
  switch (event.key) {
    case "Shift":
      shiftDown = false;
      break;

    default:
      break;
  }
};

document.getElementById("gravity-input").addEventListener("onvaluechange", (event) => {
  gravity = event.detail.value;
  console.log(event);
});

document.getElementById("wind-input").addEventListener("onvaluechange", (event) => {
  wind = event.detail.value;
  console.log(event);
});
