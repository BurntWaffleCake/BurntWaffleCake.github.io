import { Vector2 } from "./Vector2.js"

const debug = true

export class Face {
    constructor(from, to) {
        this.from = from.clone()
        this.to = to.clone()

        let delta = to.clone().subtract(from).normal()
        this.normal = new Vector2(-delta.y, delta.x)
    }

    center() {
        return this.to.clone().subtract(this.from).scale(.5).add(this.from);
    }
}

export class Polygon {
    constructor(points, pos = new Vector2(0, 0), rot = 0, initVel = new Vector2(0, 0), initRotVel = 0) {
        this.points = points;
        this.sides = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.sides.push(new Face(points[i], points[i + 1]))
        }
        this.sides.push(new Face(points[points.length - 1], points[0]))

        this.pos = pos
        this.vel = initVel
        this.rot = rot;
        this.rotVel = initRotVel;

        this.mass = this.getArea()
        this.invMass
        this.i
        this.invI

        this.fillColor = "rgb(255, 255, 255)"
        this.strokeColor = "rgb(255, 255, 255)"

        this.selfProjection = []
        for (let side of this.sides) {
            this.selfProjection.push(this.projectToAxis(side.normal))
        }
        }

    getArea() {
        let crossSum = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            let a = this.points[i];
            let b = this.points[i+1];
            crossSum += a.cross(b)
        }
        crossSum += this.points[this.points.length-1].cross(this.points[0])

        return Math.abs(crossSum) / 2
    }

    getRotRadians() {
        return this.rot * Math.PI / 180;
    }

    toObjectSpace(vector = Vector2.prototype) {
        let delta = vector.clone().subtract(this.pos)
        return this.toWorldSpace(delta)
    }

    toWorldSpace(vector) {
        return new Vector2(
            this.pos.x + vector.x * Math.cos(this.getRotRadians()) - vector.y * Math.sin(this.getRotRadians()),
            this.pos.y + vector.x * Math.sin(this.getRotRadians()) + vector.y * Math.cos(this.getRotRadians()),
        )
    }

    getWorldCoordinates() {
        var worldPoints = [];
        for (let point of this.points) {
            worldPoints.push(this.toWorldSpace(point));
        }
        return worldPoints;
    }

    applyImpulse(impulse, pos, normal) {
        this.vel.add()

        box1.dx += impulseVec.x * box1.invm
        box1.dy += impulseVec.y * box1.invm
        box2.dx += impulseVec.x * -box2.invm
        box2.dy += impulseVec.y * -box2.invm

        box1.dr += box1.invi * cross(collArm1.x, collArm1.y, impulseVec.x, impulseVec.y)
        box2.dr -= box2.invi * cross(collArm2.x, collArm2.y, impulseVec.x, impulseVec.y)
    }

    render(ctx = CanvasRenderingContext2D) {
        ctx.strokeStyle = this.strokeColor;
        ctx.fillStyle = this.fillColor;

        let worldCoords = this.getWorldCoordinates();

        ctx.save();

        ctx.beginPath();

        ctx.fillStyle = this.fillColor
        ctx.strokeStyle = this.strokeColor

        //draw polygon
        ctx.moveTo(worldCoords[0].x, worldCoords[0].y);
        for (let point of worldCoords) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(worldCoords[0].x, worldCoords[0].y);
        ctx.stroke()

        if (debug) {
            //draw foward
            ctx.beginPath()
            ctx.strokeStyle = "rgb(255, 0, 0)"
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(this.pos.x + 50 * Math.cos(this.getRotRadians()), this.pos.y + 50 * Math.sin(this.getRotRadians()))
            ctx.stroke();

            ctx.beginPath()
            ctx.strokeStyle = "rgb(0, 255, 0)"
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(this.pos.x + 50 * Math.cos(this.getRotRadians() - Math.PI / 2), this.pos.y + 50 * Math.sin(this.getRotRadians() - Math.PI / 2))
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = "rgb(0, 255, 255)"
            //draw normals
            for (let face of this.sides) {
                let worldPoint = this.toWorldSpace(face.center())
                let worldNormal = this.toWorldSpace(face.normal)

                ctx.moveTo(worldPoint.x, worldPoint.y)
                ctx.lineTo(worldPoint.x + (worldNormal.x - this.pos.x) * 25, worldPoint.y + (worldNormal.y - this.pos.y) * 25);
                ctx.fillRect(worldPoint.x + (worldNormal.x - this.pos.x) * 25, worldPoint.y + (worldNormal.y - this.pos.y) * 25, 3, 3)
            }
            ctx.stroke()
        }

        ctx.restore();
    }

    projectToAxis(axis) {
        let points = this.getWorldCoordinates()

        let max = points[0]
        let maxMag = max.projectToAxis(axis)
        // let maxMag = max.dot(axis)

        let min = points[0]
        let minMag = maxMag

        for (let i = 1; i< points.length; i++) {
            let point = points[i]
            let mag = point.projectToAxis(axis)
            // let mag = point.dot(point)

            if (mag < minMag) {
                min = point
                minMag = mag
            } else if (mag > maxMag) {
                max = point
                maxMag = mag
            }
        }
        return {minPoint: min, minMag: minMag, maxPoint: max, maxMag: maxMag}
    }

    segmentOverlaps(min1, max1, min2, max2) {
        let overlap = Math.max(0, Math.min(max1, max2) - Math.max(min1, min2))

        if (overlap > 0) {
            return overlap
        }
        return false
    }

    bruteForceTestCollision(polygon, ctx) {
        let minOverlap = Number.MAX_VALUE
        let minFace

        let colliding = true

        for (let face of this.sides) {
            let axis = face.normal.clone().rotate(this.getRotRadians())
            // console.log(axis)

            let selfProj = this.projectToAxis(axis)
            let compProj = polygon.projectToAxis(axis)

            let overlap = this.segmentOverlaps(selfProj.minMag, selfProj.maxMag, compProj.minMag, compProj.maxMag)
            if (overlap === false) {
                colliding = false
            } else if (overlap < minOverlap) {
                minOverlap = overlap
                minFace = new Face(this.toWorldSpace(face.from), this.toWorldSpace(face.to))
            }

            let selfMinAxis = axis.clone().scale(selfProj.minMag / 5).add(this.pos)
            let selfMaxAxis = axis.clone().scale(selfProj.maxMag / 5).add(this.pos)
            let compMinAxis = axis.clone().scale(compProj.minMag / 5).add(this.pos)
            let compMaxAxis = axis.clone().scale(compProj.maxMag / 5).add(this.pos)

            // console.log(selfMinAxis)
            ctx.fillStyle = (overlap) ? "rgb(0,255,255)" : "rgb(0,0,255)"
            ctx.fillRect(selfMinAxis.x-2.5, selfMinAxis.y-2.5, 5, 5)
            ctx.fillRect(selfMaxAxis.x-2.5, selfMaxAxis.y-2.5, 5, 5)
            ctx.fillStyle = (overlap) ? "rgb(255, 0 ,255)" : "rgb(255,0,0)"
            ctx.fillRect(compMinAxis.x-2.5, compMinAxis.y-2.5, 5, 5)
            ctx.fillRect(compMaxAxis.x-2.5, compMaxAxis.y-2.5, 5, 5)

        }

        for (let face of polygon.sides) {
            let axis = face.normal.clone().rotate(polygon.getRotRadians())

            let selfProj = this.projectToAxis(axis)
            let compProj = polygon.projectToAxis(axis)

            let overlap = this.segmentOverlaps(selfProj.minMag, selfProj.maxMag, compProj.minMag, compProj.maxMag)
            if (overlap === false) {
                colliding = false
            } else if (overlap < minOverlap) {
                minOverlap = overlap
                minFace = new Face(polygon.toWorldSpace(face.from), polygon.toWorldSpace(face.to))
            }

            let selfMinAxis = axis.clone().scale(selfProj.minMag / 5).add(polygon.pos)
            let selfMaxAxis = axis.clone().scale(selfProj.maxMag / 5).add(polygon.pos)
            let compMinAxis = axis.clone().scale(compProj.minMag / 5).add(polygon.pos)
            let compMaxAxis = axis.clone().scale(compProj.maxMag / 5).add(polygon.pos)

            // console.log(selfMinAxis)
            ctx.fillStyle = (overlap) ? "rgb(0,255,255)" : "rgb(0,0,255)"
            ctx.fillRect(selfMinAxis.x-2.5, selfMinAxis.y-2.5, 5, 5)
            ctx.fillRect(selfMaxAxis.x-2.5, selfMaxAxis.y-2.5, 5, 5)
            ctx.fillStyle = (overlap) ? "rgb(255, 0 ,255)" : "rgb(255,0,0)"
            ctx.fillRect(compMinAxis.x-2.5, compMinAxis.y-2.5, 5, 5)
            ctx.fillRect(compMaxAxis.x-2.5, compMaxAxis.y-2.5, 5, 5)
        }

        if (!colliding) { return false }
        return {overlap: minOverlap, face: minFace}
    }


    testProjection(polygon) {
        let minOverlap = Number.MAX_VALUE
        let minFace
        for (let i = 0; i<this.sides.length; i++) {
            let face = this.sides[i]
            let selfProj = this.selfProjection[i]
            let compProj = polygon.projectToAxis(face.normal)

            let overlap = this.segmentOverlaps(selfProj.minMag, selfProj.maxMag, compProj.minMag, compProj.maxMag)
            if (overlap == false) {
                return false
            } else if (minOverlap > overlap) {
                minOverlap = overlap
                minFace = face
            }
        }
        return {overlap: minOverlap, face: minFace}
    }

    testCollision(polygon) {
        let selfOverlap = this.testProjection(polygon)
        let compOverlap = polygon.testProjection(this)

        let minOverlap
        let minFace
        if (selfOverlap.overlap <= compOverlap.overlap) {
            minOverlap = selfOverlap.overlap
            minFace = selfOverlap.face
        } else {
            minOverlap = compOverlap.overlap
            minFace = compOverlap.face
        }

        if (selfOverlap == false || compOverlap == false) {return false} else { return {overlap: minOverlap, face: minFace} }
    }

    tick(dt, t) {
        this.pos.add(this.vel.clone().scale(dt));
        this.rot += this.rotVel * dt
    }
}

export class Box extends Polygon {
    constructor(pos = new Vector2(0, 0), size = new Vector2(50, 50), rot = 0, initVel = new Vector2(0, 0), initRotVel = 0) {
        let xHalf = size.x / 2
        let yHalf = size.y / 2

        super(
            [
                new Vector2(-xHalf, yHalf),
                new Vector2(xHalf, yHalf),
                new Vector2(xHalf, -yHalf),
                new Vector2(-xHalf, -yHalf)
            ],
            pos,
            rot,
            initVel,
            initRotVel
        )

        this.size = size
        this.topLeft = this.points[0]
    }
}

export class RegularPolygon extends Polygon {
    constructor(pos = new Vector2(0, 0), radius = 25, resolution = 6, rot = 0, initVel = new Vector2(0, 0), initRotVel = 0) {
        let points = []

        let rad = 2 * Math.PI / resolution - 0
        for (let i = 0; i < resolution; i++) {
            points.push(new Vector2(radius * Math.cos(-rad * i), radius * Math.sin(-rad * i)))
        }

        super(points, pos, rot, initVel, initRotVel)

        this.radius = radius
    }
}