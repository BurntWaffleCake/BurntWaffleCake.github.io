class Box {
  constructor(x = width / 2, y = height / 2, w = 50, h = 50, r = 0, dx = 0, dy = 0, dr = 0) {
    this.x = x; //box center x
    this.y = y; //box center y
    this.dx = dx;
    this.dy = dy;

    this.r = ((r % 360) * Math.PI) / 180; //rotation in radians
    this.dr = ((dr % 360) * Math.PI) / 180; //rotation in radians

    this.w = w; //box width
    this.h = h; //box height
    this.m = w * h; //mass

    if (this.m <= 0) {
      this.invm = 0;
    } else {
      this.invm = 1 / this.m;
    }

    this.color = "rgb(255,255,255)";
    this.e = 0.5;

    this.i = (1 / 12) * this.m * (w * w + h * h);
    if (this.i <= 0) {
      this.invi = 0;
    } else {
      this.invi = 1 / this.i;
    }
    this.anchored = false;
  }

  setRotation(degrees) {
    this.r = ((degrees % 360) * Math.PI) / 180;
  }

  setRotationDelta(degrees) {
    this.dr = ((degrees % 360) * Math.PI) / 180;
  }

  projectPoint(x, y, ax, ay) {
    let divResult = (x * ax + y * ay) / (ax * ax + ay + ay);
    let cornerProj = { x: divResult * ax, y: divResult * ay };
    return ax * cornerProj.x + ay * cornerProj.y;
  }

  getClosestPoint(x, y) {
    let points = this.getWorldCoordinates();
    let closestPoint = points[0];
    let dis = Math.sqrt((x - closestPoint.x) ** 2 + (y - closestPoint.y) ** 2);

    for (let i = 1; i < points.length; i++) {
      let nextPoint = points[i];
      let newDis = Math.sqrt((x - nextPoint.x) ** 2 + (y - nextPoint.y) ** 2);
      if (newDis < dis) {
        closestPoint = nextPoint;
        dis = newDis;
      }
    }
    return { point: closestPoint, distance: dis };
  }

  getCoordinates() {
    let hw = this.w / 2;
    let hh = this.h / 2;

    let tl = { x: -hw, y: -hh };
    let tr = { x: +hw, y: -hh };
    let br = { x: +hw, y: +hh };
    let bl = { x: -hw, y: +hh };

    return [tl, tr, br, bl];
  }

  getProjection(lx, ly) {
    let points = this.getWorldCoordinates();
    let minPoint = points[0];
    let min = this.projectPoint(points[0].x, points[0].y, lx, ly);
    let maxPoint = points[0];
    let max = this.projectPoint(points[0].x, points[0].y, lx, ly);

    for (let i = 1; i < points.length; i++) {
      let projection = this.projectPoint(points[i].x, points[i].y, lx, ly);
      if (projection < min) {
        minPoint = points[i];
        min = projection;
      } else if (projection > max) {
        maxPoint = points[i];
        max = projection;
      }
    }

    return { min: min, max: max, minPoint: minPoint, maxPoint: maxPoint };
  }

  testBounds() {
    let widthProj = this.getProjection(width, 0);
    let heightProj = this.getProjection(0, height);

    if (widthProj.maxPoint.x > width || widthProj.minPoint.x < 0) {
      if (widthProj.minPoint.x < 0) {
        this.x -= widthProj.minPoint.x;
      } else {
        this.x -= widthProj.maxPoint.x - width;
      }
      this.dx = -this.dx * restitution;
    }

    if (heightProj.maxPoint.y > height || heightProj.minPoint.y < 0) {
      if (heightProj.minPoint.y < 0) {
        this.y -= heightProj.minPoint.y;
      } else {
        this.y -= heightProj.maxPoint.y - height;
      }
      this.dy = -this.dy * restitution;
    }
  }

  getCollisionAxis() {
    let points = this.getWorldCoordinates();
    let axis1 = { x: points[1].x - points[0].x, y: points[1].y - points[0].y };
    let axis1Mag = Math.sqrt(axis1.x * axis1.x + axis1.y * axis1.y);
    axis1.x = axis1.x / axis1Mag;
    axis1.y = axis1.y / axis1Mag;

    let axis2 = { x: points[2].x - points[1].x, y: points[2].y - points[1].y };
    let axis2Mag = Math.sqrt(axis2.x * axis2.x + axis2.y * axis2.y);
    axis2.x = axis2.x / axis2Mag;
    axis2.y = axis2.y / axis2Mag;
    return [axis1, axis2];
  }

  toWorldSpace(x, y) {
    return {
      x: this.x + x * Math.cos(this.r) - y * Math.sin(this.r),
      y: this.y + x * Math.sin(this.r) + y * Math.cos(this.r),
    };
  }

  getWorldCoordinates() {
    let hw = this.w / 2;
    let hh = this.h / 2;

    let tl = this.toWorldSpace(-hw, -hh); // { x: -hw, y: -hh }
    let tr = this.toWorldSpace(hw, -hh);
    let bl = this.toWorldSpace(-hw, hh);
    let br = this.toWorldSpace(hw, hh);

    return [tl, tr, br, bl];
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3);
    let coords = this.getWorldCoordinates();

    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.lineTo(coords[0].x, coords[0].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgb(0, 255, 255)";
    ctx.moveTo(this.x, this.y);
    let foward = this.toWorldSpace(this.w / 2, 0);
    ctx.lineTo(foward.x, foward.y);
    ctx.stroke();
  }
}

function drawLineTo(x, y, tox, toy, color = "rgb(255,255,255)") {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x, y);
  ctx.lineTo(tox, toy);
  ctx.stroke();
}

function round(value, decimals) {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

function getPointsBelow() {}

function getCollidingPoint(box1, box2, normal) {
  let mag = Math.sqrt((box2.x - box1.x) ** 2 + (box2.y - box1.y) ** 2);
  let delta = { x: (box2.x - box1.x) / mag, y: (box2.y - box1.y) / mag };

  let box1Coords = box1.getCoordinates();
  let box2Coords = box2.getCoordinates();

  let maxPoint = box1.toWorldSpace(box1Coords[0].x, box1Coords[0].y);
  let pointDelta = { x: maxPoint.x - box1.x, y: maxPoint.y - box1.y };
  let pointMag = Math.sqrt(pointDelta.x * pointDelta.x + pointDelta.y * pointDelta.y);
  let maxDot = (delta.x * pointDelta.x) / pointMag + (delta.y * pointDelta.y) / pointMag;

  for (let i = 1; i < box1Coords.length; i++) {
    let point = box1Coords[i];
    let worldPoint = box1.toWorldSpace(point.x, point.y);

    let pointDelta = { x: worldPoint.x - box1.x, y: worldPoint.y - box1.y };
    let mag = Math.sqrt(pointDelta.x * pointDelta.x + pointDelta.y * pointDelta.y);
    pointDelta = { x: pointDelta.x / mag, y: pointDelta.y / mag };

    let dot = delta.x * pointDelta.x + delta.y * pointDelta.y;

    if (dot > maxDot) {
      maxDot = dot;
      maxPoint = worldPoint;
    }
  }

  for (point of box2Coords) {
    let worldPoint = box2.toWorldSpace(point.x, point.y);

    let pointDelta = { x: worldPoint.x - box2.x, y: worldPoint.y - box2.y };
    let mag = Math.sqrt(pointDelta.x * pointDelta.x + pointDelta.y * pointDelta.y);
    pointDelta = { x: pointDelta.x / mag, y: pointDelta.y / mag };

    let dot = -delta.x * pointDelta.x + -delta.y * pointDelta.y;

    if (dot > maxDot) {
      maxDot = dot;
      maxPoint = worldPoint;
    }
  }
  return maxPoint;
}

function testProjectionOverlap(proj1, proj2) {
  let overlap = Math.max(0, Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min));

  if (overlap > 0) {
    return overlap;
  }
  return false;
}

function projectVectorToLine(x, y, lx, ly) {
  let dotxl = x * lx + y * ly; //dot input vector and plane vector
  let dotll = lx * lx + ly * ly; //dot plane vector on itself

  let projX = (dotxl / dotll) * lx;
  let projY = (dotxl / dotll) * ly;
  return { x: projX, y: projY };
}

function testBoxCollision(box1, box2) {
  let satAxisBox1 = box1.getCollisionAxis();
  let satAxisBox2 = box2.getCollisionAxis();

  var colliding = true;
  let mvt = Number.MAX_VALUE;
  let normal = undefined;
  let satShape = undefined; // true: box1, false: box2

  for (axis of satAxisBox1) {
    let box1Proj = box1.getProjection(axis.x, axis.y);
    let box2Proj = box2.getProjection(axis.x, axis.y);

    let overlap = testProjectionOverlap(box1Proj, box2Proj);

    if (!overlap) {
      colliding = false;
    } else if (overlap < mvt) {
      mvt = overlap;
      normal = axis;
      satShape = true;
    }
  }

  for (axis of satAxisBox2) {
    let box1Proj = box1.getProjection(axis.x, axis.y);
    let box2Proj = box2.getProjection(axis.x, axis.y);

    let overlap = testProjectionOverlap(box1Proj, box2Proj);

    if (!overlap) {
      colliding = false;
    } else if (overlap < mvt) {
      mvt = overlap;
      normal = axis;
      satShape = false;
    }
  }

  if (colliding) {
    let dot = normal.x * (box2.x - box1.x) + normal.y * (box2.y - box1.y);

    if (dot < 0) {
      normal.x = -normal.x;
      normal.y = -normal.y;
    }

    ctx.beginPath();
    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.moveTo(box1.x, box1.y);
    ctx.lineTo(box1.x + mvt * normal.x, box1.y + mvt * normal.y);
    ctx.stroke();

    return { colliding: true, mtx: mvt, normal: normal, incidentFace: {} };
  } else {
    box2.color = "rgb(255,255,255)";
    return { colliding: false };
  }
}

function cross(x1, y1, x2, y2) {
  return x1 * y2 - y1 * x2;
}

function resolveCollision(box1, box2, mvt, normal, collisionPoint) {
  if (box1.anchored && box2.anchored) {
    return;
  }

  if (box1.anchored) {
    box2.x += mvt * normal.x;
    box2.y += mvt * normal.y;
  } else if (box2.anchored) {
    box1.x -= mvt * normal.x;
    box1.y -= mvt * normal.y;
  } else {
    box1.x -= (mvt / 2) * normal.x;
    box1.y -= (mvt / 2) * normal.y;
    box2.x += (mvt / 2) * normal.x;
    box2.y += (mvt / 2) * normal.y;
  }

  let collArm1 = { x: collisionPoint.x - box1.x, y: collisionPoint.y - box1.y };
  let rotVel1 = { x: -box1.dr * collArm1.y, y: box1.dr * collArm1.x };
  let closVel1 = { x: box1.dx + rotVel1.x, y: box1.dy + rotVel1.y };

  let collArm2 = { x: collisionPoint.x - box2.x, y: collisionPoint.y - box2.y };
  let rotVel2 = { x: -box2.dr * collArm2.y, y: box2.dr * collArm2.x };
  let closVel2 = { x: box2.dx + rotVel2.x, y: box2.dy + rotVel2.y };

  let impAug1 = cross(collArm1.x, collArm1.y, normal.x, normal.y);
  impAug1 = impAug1 * impAug1 * box1.invi;
  let impAug2 = cross(collArm2.x, collArm2.y, normal.x, normal.y);
  impAug2 = impAug2 * impAug2 * box2.invi;

  let relVel = { x: closVel1.x - closVel2.x, y: closVel1.y - closVel2.y };
  let sepVel = relVel.x * normal.x + relVel.y * normal.y;
  let newsepVel = -sepVel * Math.min(box1.e, box2.e);
  let vsepDiff = newsepVel - sepVel;

  let impulse = vsepDiff / (box1.invm + box2.invm + impAug1 + impAug2);
  let impulseVec = { x: impulse * normal.x, y: impulse * normal.y };

  box1.dx += impulseVec.x * box1.invm;
  box1.dy += impulseVec.y * box1.invm;
  box2.dx += impulseVec.x * -box2.invm;
  box2.dy += impulseVec.y * -box2.invm;

  box1.dr += box1.invi * cross(collArm1.x, collArm1.y, impulseVec.x, impulseVec.y);
  box2.dr -= box2.invi * cross(collArm2.x, collArm2.y, impulseVec.x, impulseVec.y);
}

function clearCanvas() {
  ctx.clearRect(0, 0, width, height);
}

function calculatePhysics(dt) {
  for (box of boxes) {
    if (box.anchored) {
      box.dx = 0;
      box.dy = 0;
      box.dr = 0;
      continue;
    }
    box.x += box.dx * dt;
    box.y += box.dy * dt;
    box.r += box.dr * dt;
    box.testBounds();
    box.dy += gravity * dt;
  }
}

const width = 1000;
const height = 1000;
const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width;
ctx.canvas.height = height;

let boxes = [];

const gravity = 0;
const restitution = 1;
var substeps = 4;

let time = 0.0;
function loop(t) {
  dt = t / 1000 - time;

  clearCanvas();
  if (mouse1Down) {
    let point = getMousePos(canvas, mousePos);
    let closestBox = boxes[0];

    if (closestBox !== undefined) {
      let distance = Math.sqrt((point.x - closestBox.x) ** 2 + (point.y - closestBox.y) ** 2);
      for (let i = 1; i < boxes.length; i++) {
        let nextBox = boxes[i];
        let nextDistance = Math.sqrt((point.x - nextBox.x) ** 2 + (point.y - nextBox.y) ** 2);
        if (nextDistance < distance) {
          closestBox = nextBox;
          distance = nextDistance;
        }
      }
      closestBox.x = point.x;
      closestBox.y = point.y;

      closestBox.dx = mouseDelta.x * 50;
      closestBox.dy = mouseDelta.y * 50;
    }
  }

  for (let c = 0; c < substeps; c++) {
    let cdt = dt / substeps;
    calculatePhysics(cdt);

    for (let i = 0; i < boxes.length; i++) {
      let box1 = boxes[i];
      for (let n = i + 1; n < boxes.length; n++) {
        let box2 = boxes[n];

        let result = testBoxCollision(box1, box2);
        if (result.colliding) {
          let collisionPoint = getCollidingPoint(box1, box2);
          ctx.fillStyle = "rgb(255, 0, 0)";
          ctx.fillRect(collisionPoint.x - 2.5, collisionPoint.y - 2.5, 5, 5);
          resolveCollision(box1, box2, result.mtx, result.normal, collisionPoint);
        }
      }
    }
  }

  for (box of boxes) {
    box.render(ctx);
  }

  time = t / 1000;
  window.requestAnimationFrame(loop);
}

function startup() {
  console.log("Starting simulation");

  for (let i = 0; i < 25; i++) {
    boxes.push(
      new Box(
        Math.random() * width,
        Math.random() * height,
        50 + Math.random() * 55,
        50 + Math.random() * 55,
        360 * Math.random(),
        150 - Math.random() * 300,
        150 - Math.random() * 300,
        150 - Math.random() * 300
      )
    );
  }

  window.requestAnimationFrame(loop);
}

window.addEventListener("load", (event) => {
  startup();
});

function getMousePos(canvas, point) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: ((point.x - rect.left) / rect.width) * width,
    y: ((point.y - rect.top) / rect.height) * height,
  };
}

let mouse1Down = false;
let mousePos = { x: 0, y: 0 };
let mouseDelta = { x: 0, y: 0 };

canvas.addEventListener("mousedown", (event) => {
  if (event.buttons == 1) {
    mouse1Down = true;
  }
});

document.addEventListener("mouseup", (event) => {
  if (event.buttons == 0) {
    mouse1Down = false;
  }
});

canvas.addEventListener("mousemove", (event) => {
  mousePos.x = event.clientX;
  mousePos.y = event.clientY;
  mouseDelta.x = event.movementX;
  mouseDelta.y = event.movementY;
});

document.onkeydown = function (event) {
  if (event.key == " ") {
    boxes.push(
      new Box(
        Math.random() * width,
        Math.random() * height,
        50 + Math.random() * 55,
        50 + Math.random() * 55,
        360 * Math.random(),
        150 - Math.random() * 300,
        150 - Math.random() * 300,
        150 - Math.random() * 300
      )
    );
  }
};

const clearButton = document.getElementById("clearButton");
const flingButton = document.getElementById("flingButton");

clearButton.onkeydown = function (e) {
  e.preventDefault();
};

clearButton.onclick = function (e) {
  boxes = [];
};

flingButton.onkeydown = function (e) {
  e.preventDefault();
};

flingButton.onclick = function (e) {
  boxes.forEach((box) => {
    box.dx += box.m / 2 - Math.random() * box.m;
    box.dy += box.m / 2 - Math.random() * box.m;
  });
};
