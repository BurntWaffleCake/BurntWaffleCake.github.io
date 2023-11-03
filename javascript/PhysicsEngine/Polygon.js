import { Vector2 } from "./Vector2.js";

const debug = true;

function minDisToLineSeg(a, b, e) {
  let ab = b.clone().subtract(a);
  let be = e.clone().subtract(b);
  let ae = e.clone().subtract(a);

  let ab_be = ab.dot(be);
  let ab_ae = ab.dot(ae);

  if (ab_be > 0) {
    return e.clone().subtract(b).magnitude();
  } else if (ab_ae < 0) {
    return e.clone().subtract(a).magnitude();
  } else {
    let mod = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    return Math.abs(ab.x * ae.y - ab.y * ae.x) / mod;
  }
}

export class Face {
  constructor(from, to) {
    this.from = from.clone();
    this.to = to.clone();

    let delta = to.clone().subtract(from).normal();
    this.normal = new Vector2(-delta.y, delta.x);
  }

  center() {
    return this.to.clone().subtract(this.from).scale(0.5).add(this.from);
  }

  rotate(center, rad) {
    this.from = center.clone().subtract(this.from).rotate(rad).add(center);
    this.to = center.clone().subtract(this.to).rotate(rad).add(center);
    return this;
  }

  clone() {
    return new Face(this.from, this.to);
  }

  render(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 255, 255)";
    ctx.moveTo(this.from.x, this.from.y);
    ctx.moveTo(this.to.x, this.to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgb(255,255,0)";
    ctx.arc(this.from.x, this.from.y, 5, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgb(255,0,255)";
    ctx.arc(this.to.x, this.to.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

export class Model {
  constructor(
    polygons,
    pos = new Vector2(0, 0),
    rot = 0,
    initVel = new Vector2(0, 0),
    initRotVel = 0
  ) {
    this.components = [];
    polygons.forEach((element) => {
      this.components.push({
        polygon: element,
        offset: element.pos.clone(),
        rotation: element.rot - rot,
      });
    });

    this.pos = pos;
    this.vel = initVel;
    this.rot = (rot * Math.PI) / 180;
    this.rotVel = (initRotVel * Math.PI) / 180;

    this.e = 0;
    this.df = 0.4;
    this.sf = 0.6;
    this.mTot = 0;
    this.iTot = 0;

    polygons.forEach((element) => {
      this.mTot += element.mass;
      this.iTot += element.mass * element.pos.magnitude() ** 2;
    });

    this.invMTot = 1 / this.mTot;
    this.invITot = 1 / this.iTot;
  }

  render(ctx) {
    this.components.forEach((element) => {
      let rot = element.rotation;
      let offset = element.offset;
      let polygon = element.polygon;

      polygon.render(ctx);
    });
  }

  tick(dt) {
    if (this.anchored) {
      this.vel.set(0, 0);
      this.rotVel = 0;
      return;
    } else if (this.lockRot) {
      this.rotVel = 0;
      return;
    }
    this.pos.add(this.vel.clone().scale(dt));
    this.rot += this.rotVel * dt;

    this.components.forEach((element) => {
      let rot = element.rotation;
      let offset = element.offset;
      let polygon = element.polygon;

      polygon.rot = this.rot + rot;
      polygon.pos.set(
        this.pos.x +
          offset.x * Math.cos(this.rot) -
          offset.y * Math.sin(this.rot),
        this.pos.y +
          offset.x * Math.sin(this.rot) +
          offset.y * Math.cos(this.rot)
      );
    });
  }

  testModelCollision() {}

  testPolygonCollision(colPoly, ctx) {
    let results = [];
    this.components.forEach((element) => {
      let rot = element.rotation;
      let offset = element.offset;
      let polygon = element.polygon;

      let result = polygon.testCollision(colPoly, ctx);
      if (result == false) {
        return;
      }
      results.push({
        polygon: colPoly,
        mvt: result.mvt,
        normal: result.normal,
        points: result.points,
      });
      // this.resolveCollision(polygon, result.mvt, result.normal, result.point)
    });
    return results;
  }

  applyImpulse(impulse, pos) {
    let collArm = pos.clone().subtract(this.pos);
    this.vel.add(impulse.clone().scale(this.invMTot));
    this.rotVel += this.invITot * collArm.cross(impulse);
  }

  resolvePolygonCollision(polygon, mvt, normal, collisionPoints) {
    if (this.anchored && polygon.anchored) {
      return;
    } else if (this.anchored) {
      polygon.pos.add(normal.clone().scale(mvt / 2));
    } else if (polygon.anchored) {
      this.pos.subtract(normal.clone().scale(mvt / 2));
    } else {
      this.pos.subtract(normal.clone().scale(mvt / 2));
      polygon.pos.add(normal.clone().scale(mvt / 2));
    }

    let impulses = [];
    let collArm1s = [];
    let collArm2s = [];

    collisionPoints.forEach((collPoint) => {
      let collArm1 = collPoint.clone().subtract(this.pos);
      let rotVel1 = new Vector2(
        -this.rotVel * collArm1.y,
        this.rotVel * collArm1.x
      );
      let closVel1 = this.vel.clone().add(rotVel1);

      let collArm2 = collPoint.clone().subtract(polygon.pos);
      let rotVel2 = new Vector2(
        -polygon.rotVel * collArm2.y,
        polygon.rotVel * collArm2.x
      );
      let closVel2 = polygon.vel.clone().add(rotVel2);

      collArm1s.push(collArm1);
      collArm2s.push(collArm2);

      let impAug1 = collArm1.cross(normal);
      impAug1 = impAug1 * impAug1 * this.invITot;
      let impAug2 = collArm2.cross(normal);
      impAug2 = impAug2 * impAug2 * polygon.invI;

      let relVel = closVel1.clone().subtract(closVel2);
      let sepVel = relVel.dot(normal);
      let newSepVel = -sepVel * Math.min(this.e, polygon.e);
      let vSepDiff = newSepVel - sepVel;

      let impulse =
        vSepDiff /
        (this.invMTot + polygon.invMass + impAug1 + impAug2) /
        collisionPoints.length;
      let impulseVec = normal.clone().scale(impulse);

      impulses.push(impulseVec);

      //Friction
      let tangent = relVel
        .clone()
        .subtract(normal.clone().scale(relVel.dot(normal)));
      if (tangent.magnitude() < 0.005) {
        return;
      } //tangent is near zero
      tangent.normalize();

      let frictionAug1 = collArm1.cross(tangent);
      frictionAug1 = frictionAug1 * frictionAug1 * this.invITot;
      let frictionAug2 = collArm2.cross(tangent);
      frictionAug2 = frictionAug2 * frictionAug2 * polygon.invI;

      let impulseFriction =
        relVel.dot(tangent) /
        (frictionAug1 + frictionAug2 + this.invMTot + polygon.invMass) /
        collisionPoints.length;

      let sf = (this.sf + polygon.sf) * 0.5;
      let df = (this.df + polygon.df) * 0.5;

      let impFricVec;
      if (impulseFriction <= impulse * sf) {
        impFricVec = tangent.scale(-impulseFriction);
      } else {
        impFricVec = tangent.clone().scale(impulse * df);
      }

      collArm1s.push(collArm1);
      collArm2s.push(collArm2);

      impulses.push(impFricVec);
    });

    impulses.forEach((impulse, index) => {
      let collArm1 = collArm1s[index];
      let collArm2 = collArm2s[index];

      this.vel.add(impulse.clone().scale(this.invMTot));
      polygon.vel.subtract(impulse.clone().scale(polygon.invMass));

      this.rotVel += this.invITot * collArm1.cross(impulse);
      polygon.rotVel -= polygon.invI * collArm2.cross(impulse);
    });
  }
}

export class Polygon {
  constructor(
    points,
    pos = new Vector2(0, 0),
    rot = 0,
    initVel = new Vector2(0, 0),
    initRotVel = 0
  ) {
    this.points = points;

    this.radius = this.points[this.points.length - 1].magnitude();
    this.hullSize = new Vector2(0, 0);

    this.sides = [];
    for (let i = 0; i < points.length - 1; i++) {
      this.sides.push(new Face(points[i], points[i + 1]));

      let point = this.points[this.points.length - 1 - i];
      let mag = point.magnitude();
      if (mag > this.radius) {
        this.radius = mag;
      }
    }
    this.sides.push(new Face(points[points.length - 1], points[0]));

    this.pos = pos;
    this.vel = initVel;
    this.rot = (rot * Math.PI) / 180;
    this.rotVel = (initRotVel * Math.PI) / 180;

    this.e = 0.6;
    this.df = 0.4;
    this.sf = 0.6;

    this.lockRot = false;
    this.anchored = false;

    this.mass = this.getArea();
    this.invMass = 1 / this.mass;
    this.i = (1 / 2) * this.mass * this.radius * this.radius;
    this.invI = 1 / this.i;

    // this.fillColor = "rgb("+ String(Math.floor(Math.random() * 255)) +","+ String(Math.floor(Math.random() * 255)) +","+ String(Math.floor(Math.random() * 255)) +")"
    this.fillColor = "rgb(255, 255, 255)";
    this.strokeColor = "rgb(255, 255, 255)";
  }

  boundsCollide(polygon) {
    return (
      (polygon.pos.x - this.pos.x) ** 2 + (polygon.pos.y - this.pos.y) ** 2 <=
      (this.radius + polygon.radius) ** 2
    );
  }

  getArea() {
    let crossSum = 0;
    for (let i = 0; i < this.points.length - 1; i++) {
      let a = this.points[i];
      let b = this.points[i + 1];
      crossSum += a.cross(b);
    }
    crossSum += this.points[this.points.length - 1].cross(this.points[0]);

    return Math.abs(crossSum) / 2;
  }

  getRotDegrees() {
    return (this.rot / Math.PI) * 180;
  }

  toObjectSpace(vector = Vector2.prototype) {
    let delta = vector.clone().subtract(this.pos);
    return this.toWorldSpace(delta);
  }

  toWorldSpace(vector) {
    return new Vector2(
      this.pos.x +
        vector.x * Math.cos(this.rot) -
        vector.y * Math.sin(this.rot),
      this.pos.y + vector.x * Math.sin(this.rot) + vector.y * Math.cos(this.rot)
    );
  }

  getWorldCoordinates() {
    var worldPoints = [];
    for (let point of this.points) {
      worldPoints.push(this.toWorldSpace(point));
    }
    return worldPoints;
  }

  getWorldFaces() {
    let points = this.getWorldCoordinates();
    let sides = [];
    for (let i = 0; i < points.length - 1; i++) {
      sides.push(new Face(points[i], points[i + 1]));
    }
    sides.push(new Face(points[points.length - 1], points[0]));
    return sides;
  }

  applyImpulse(impulse, pos) {
    let collArm = pos.clone().subtract(this.pos);
    console.log(impulse.clone().scale(this.invMass));
    this.vel.add(impulse.clone().scale(this.invMass));
    this.rotVel += this.invI * collArm.cross(impulse);
  }

  render(ctx = CanvasRenderingContext2D) {
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle = this.fillColor;

    let worldCoords = this.getWorldCoordinates();

    ctx.save();

    ctx.beginPath();

    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;

    //draw polygon
    ctx.moveTo(worldCoords[0].x, worldCoords[0].y);
    for (let point of worldCoords) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.lineTo(worldCoords[0].x, worldCoords[0].y);
    // ctx.fill()
    ctx.stroke();

    //draw foward
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(
      this.pos.x + 50 * Math.cos(this.rot),
      this.pos.y + 50 * Math.sin(this.rot)
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgb(0, 255, 0)";
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(
      this.pos.x + 50 * Math.cos(this.rot - Math.PI / 2),
      this.pos.y + 50 * Math.sin(this.rot - Math.PI / 2)
    );
    ctx.stroke();

    if (debug) {
      ctx.beginPath();
      ctx.strokeStyle = "rgb(0, 255, 255)";
      //draw normals
      for (let face of this.sides) {
        let worldPoint = this.toWorldSpace(face.center());
        let worldNormal = this.toWorldSpace(face.normal);

        ctx.moveTo(worldPoint.x, worldPoint.y);
        ctx.lineTo(
          worldPoint.x + (worldNormal.x - this.pos.x) * 25,
          worldPoint.y + (worldNormal.y - this.pos.y) * 25
        );
        ctx.fillRect(
          worldPoint.x + (worldNormal.x - this.pos.x) * 25,
          worldPoint.y + (worldNormal.y - this.pos.y) * 25,
          3,
          3
        );
      }
      ctx.stroke();

      ctx.strokeStyle = "rgb(0, 255, 0)";
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  projectToAxis(axis) {
    let points = this.getWorldCoordinates();

    let max = points[0];
    let maxMag = max.projectToAxis(axis);
    // let maxMag = max.dot(axis)

    let min = points[0];
    let minMag = maxMag;

    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      let mag = point.projectToAxis(axis);
      // let mag = point.dot(point)

      if (mag < minMag) {
        min = point;
        minMag = mag;
      } else if (mag > maxMag) {
        max = point;
        maxMag = mag;
      }
    }
    return { minPoint: min, minMag: minMag, maxPoint: max, maxMag: maxMag };
  }

  segmentOverlaps(min1, max1, min2, max2) {
    let overlap = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));

    if (overlap > 0) {
      return overlap;
    }
    return false;
  }

  findCollidingPoint(polygon, ctx) {
    let collPoints = [];
    let minDis = Number.MAX_SAFE_INTEGER;

    for (let point of polygon.points) {
      for (let face of this.sides) {
        let worldPoint = polygon.toWorldSpace(point);

        let dis = minDisToLineSeg(
          this.toWorldSpace(face.from),
          this.toWorldSpace(face.to),
          worldPoint
        );

        if (dis < minDis - 0.5) {
          minDis = dis;
          collPoints = [worldPoint];
        } else if (dis < minDis + 0.5) {
          collPoints.push(worldPoint);
        }
      }
    }

    for (let point of this.points) {
      for (let face of polygon.sides) {
        let worldPoint = this.toWorldSpace(point);
        let dis = minDisToLineSeg(
          polygon.toWorldSpace(face.from),
          polygon.toWorldSpace(face.to),
          worldPoint
        );

        if (dis < minDis - 0.5) {
          minDis = dis;
          collPoints = [worldPoint];
        } else if (dis < minDis + 0.5) {
          collPoints.push(worldPoint);
        }
      }
    }

    if (debug) {
      collPoints.forEach((point) => {
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.fillRect(point.x, point.y, 10, 10);
      });
    }

    return collPoints;
  }

  resolveCollision(polygon, mvt, normal, collisionPoints) {
    if (this.anchored && polygon.anchored) {
      // return
    } else if (this.anchored) {
      polygon.pos.add(normal.clone().scale(mvt / 2));
    } else if (polygon.anchored) {
      this.pos.subtract(normal.clone().scale(mvt / 2));
    } else {
      this.pos.subtract(normal.clone().scale(mvt / 2));
      polygon.pos.add(normal.clone().scale(mvt / 2));
    }

    let impulses = [];
    let collArm1s = [];
    let collArm2s = [];

    collisionPoints.forEach((collPoint) => {
      let collArm1 = collPoint.clone().subtract(this.pos);
      let rotVel1 = new Vector2(
        -this.rotVel * collArm1.y,
        this.rotVel * collArm1.x
      );
      let closVel1 = this.vel.clone().add(rotVel1);

      let collArm2 = collPoint.clone().subtract(polygon.pos);
      let rotVel2 = new Vector2(
        -polygon.rotVel * collArm2.y,
        polygon.rotVel * collArm2.x
      );
      let closVel2 = polygon.vel.clone().add(rotVel2);

      collArm1s.push(collArm1);
      collArm2s.push(collArm2);

      let impAug1 = collArm1.cross(normal);
      impAug1 = impAug1 * impAug1 * this.invI;
      let impAug2 = collArm2.cross(normal);
      impAug2 = impAug2 * impAug2 * polygon.invI;

      let relVel = closVel1.clone().subtract(closVel2);
      let sepVel = relVel.dot(normal);
      let newSepVel = -sepVel * Math.min(this.e, polygon.e);
      let vSepDiff = newSepVel - sepVel;

      let impulse =
        vSepDiff /
        (this.invMass + polygon.invMass + impAug1 + impAug2) /
        collisionPoints.length;
      let impulseVec = normal.clone().scale(impulse);

      impulses.push(impulseVec);

      //Friction
      let tangent = relVel
        .clone()
        .subtract(normal.clone().scale(relVel.dot(normal)));
      if (tangent.magnitude() < 0.005) {
        return;
      } //tangent is near zero
      tangent.normalize();

      let frictionAug1 = collArm1.cross(tangent);
      frictionAug1 = frictionAug1 * frictionAug1 * this.invI;
      let frictionAug2 = collArm2.cross(tangent);
      frictionAug2 = frictionAug2 * frictionAug2 * polygon.invI;

      let impulseFriction =
        relVel.dot(tangent) /
        (frictionAug1 + frictionAug2 + this.invMass + polygon.invMass) /
        collisionPoints.length;

      let sf = (this.sf + polygon.sf) * 0.5;
      let df = (this.df + polygon.df) * 0.5;

      let impFricVec;
      if (impulseFriction <= impulse * sf) {
        impFricVec = tangent.scale(-impulseFriction);
      } else {
        impFricVec = tangent.clone().scale(impulse * df);
      }

      collArm1s.push(collArm1);
      collArm2s.push(collArm2);

      impulses.push(impFricVec);
    });

    impulses.forEach((impulse, index) => {
      let collArm1 = collArm1s[index];
      let collArm2 = collArm2s[index];

      this.vel.add(impulse.clone().scale(this.invMass));
      polygon.vel.subtract(impulse.clone().scale(polygon.invMass));

      this.rotVel += this.invI * collArm1.cross(impulse);
      polygon.rotVel -= polygon.invI * collArm2.cross(impulse);
    });
  }

  testCollision(polygon, ctx) {
    let minOverlap = Number.MAX_VALUE;
    let normal;

    for (let face of this.sides) {
      let axis = this.toWorldSpace(face.normal.clone()).subtract(this.pos);

      let selfProj = this.projectToAxis(axis);
      let compProj = polygon.projectToAxis(axis);

      let overlap = this.segmentOverlaps(
        selfProj.minMag,
        selfProj.maxMag,
        compProj.minMag,
        compProj.maxMag
      );
      if (overlap == false) {
        return false;
      } else if (overlap < minOverlap) {
        minOverlap = overlap;
        normal = axis;
      }
      // debug render //
      let selfMinAxis = axis
        .clone()
        .scale(selfProj.minMag / 5)
        .add(this.pos);
      let selfMaxAxis = axis
        .clone()
        .scale(selfProj.maxMag / 5)
        .add(this.pos);
      let compMinAxis = axis
        .clone()
        .scale(compProj.minMag / 5)
        .add(this.pos);
      let compMaxAxis = axis
        .clone()
        .scale(compProj.maxMag / 5)
        .add(this.pos);

      if (debug) {
        ctx.fillStyle = overlap ? "rgb(0,255,255)" : "rgb(0,0,255)";
        ctx.fillRect(selfMinAxis.x - 2.5, selfMinAxis.y - 2.5, 5, 5);
        ctx.fillRect(selfMaxAxis.x - 2.5, selfMaxAxis.y - 2.5, 5, 5);
        ctx.fillStyle = overlap ? "rgb(255, 0 ,255)" : "rgb(255,0,0)";
        ctx.fillRect(compMinAxis.x - 2.5, compMinAxis.y - 2.5, 5, 5);
        ctx.fillRect(compMaxAxis.x - 2.5, compMaxAxis.y - 2.5, 5, 5);
      }
    }

    for (let face of polygon.sides) {
      let axis = polygon
        .toWorldSpace(face.normal.clone())
        .subtract(polygon.pos);

      let selfProj = this.projectToAxis(axis);
      let compProj = polygon.projectToAxis(axis);

      let overlap = this.segmentOverlaps(
        selfProj.minMag,
        selfProj.maxMag,
        compProj.minMag,
        compProj.maxMag
      );
      if (overlap == false) {
        return false;
      } else if (overlap < minOverlap) {
        minOverlap = overlap;
        normal = axis;
      }
      let selfMinAxis = axis
        .clone()
        .scale(selfProj.minMag / 5)
        .add(polygon.pos);
      let selfMaxAxis = axis
        .clone()
        .scale(selfProj.maxMag / 5)
        .add(polygon.pos);
      let compMinAxis = axis
        .clone()
        .scale(compProj.minMag / 5)
        .add(polygon.pos);
      let compMaxAxis = axis
        .clone()
        .scale(compProj.maxMag / 5)
        .add(polygon.pos);

      if (debug) {
        ctx.fillStyle = overlap ? "rgb(0,255,255)" : "rgb(0,0,255)";
        ctx.fillRect(selfMinAxis.x - 2.5, selfMinAxis.y - 2.5, 5, 5);
        ctx.fillRect(selfMaxAxis.x - 2.5, selfMaxAxis.y - 2.5, 5, 5);
        ctx.fillStyle = overlap ? "rgb(255, 0 ,255)" : "rgb(255,0,0)";
        ctx.fillRect(compMinAxis.x - 2.5, compMinAxis.y - 2.5, 5, 5);
        ctx.fillRect(compMaxAxis.x - 2.5, compMaxAxis.y - 2.5, 5, 5);
      }
    }

    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(
      this.pos.x + normal.x * minOverlap,
      this.pos.y + normal.y * minOverlap
    );
    ctx.stroke();

    let delta = polygon.pos.clone().subtract(this.pos).normalize();
    if (delta.dot(normal) < 0) {
      normal.scale(-1);
    }

    let collisionPoints = this.findCollidingPoint(polygon, ctx);
    return { mvt: minOverlap, normal: normal, points: collisionPoints };
  }

  tick(dt, t) {
    if (this.anchored) {
      this.vel.set(0, 0);
      this.rotVel = 0;
      return;
    } else if (this.lockRot) {
      this.rotVel = 0;
      return;
    }
    this.pos.add(this.vel.clone().scale(dt));
    this.rot += this.rotVel * dt;
  }
}

export class Box extends Polygon {
  constructor(
    pos = new Vector2(0, 0),
    size = new Vector2(50, 50),
    rot = 0,
    initVel = new Vector2(0, 0),
    initRotVel = 0
  ) {
    let xHalf = size.x / 2;
    let yHalf = size.y / 2;

    super(
      [
        new Vector2(-xHalf, yHalf),
        new Vector2(xHalf, yHalf),
        new Vector2(xHalf, -yHalf),
        new Vector2(-xHalf, -yHalf),
      ],
      pos,
      rot,
      initVel,
      initRotVel
    );

    this.size = size;
    this.topLeft = this.points[0];
    this.i =
      (1 / 12) *
      this.mass *
      (this.size.x * this.size.x + this.size.y * this.size.y);
    this.invI = 1 / this.i;
  }
}

export class RegularPolygon extends Polygon {
  constructor(
    pos = new Vector2(0, 0),
    size = new Vector2(25, 25),
    resolution = 6,
    rot = 0,
    initVel = new Vector2(0, 0),
    initRotVel = 0
  ) {
    let points = [];

    let rad = (2 * Math.PI) / resolution - 0;
    for (let i = 0; i < resolution; i++) {
      points.push(
        new Vector2(size.x * Math.cos(-rad * i), size.y * Math.sin(-rad * i))
      );
    }

    super(points, pos, rot, initVel, initRotVel);

    this.size = size;
  }
}

export class Wall extends Polygon {
  constructor(
    pos = new Vector2(0, 0),
    length = 10,
    rot = 0,
    initVel = new Vector2(0, 0),
    initRotVel = 0
  ) {
    let points = [new Vector2(length / 2, 0), new Vector2(-length / 2, 0)];
    super(points, pos, rot, initVel, initRotVel);
  }
}
