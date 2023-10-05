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

        this.mass
        this.invMass
        this.i
        this.invI

        this.fillColor = "rgb(255, 255, 255)"
        this.strokeColor = "rgb(255, 255, 255)"
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
            }
            ctx.stroke()
        }

        ctx.restore();
    }

    tick(dt, t) {
        this.pos.add(this.vel.clone().scale(dt));
        // this.vel.set(100 * Math.cos(t), 0)
        this.rot += this.rotVel * dt
    }
}

export class Box extends Polygon {
    constructor(pos = new Vector2(0, 0), size = new Vector2(50, 50), rot = 0, initVel = new Vector2(0, 0), initRotVel = 0) {
        super(
            [
                new Vector2(-size.x, size.y),
                new Vector2(size.x, size.y),
                new Vector2(size.x, -size.y),
                new Vector2(-size.x, -size.y)
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

        super(
            points,
            pos,
            rot,
            initVel,
            initRotVel
        )

        this.radius = radius
    }
}