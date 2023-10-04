import {Vector2} from "./Vector2.js"

export class Face {
    constructor(from, to) {
        this.from = from.clone()
        this.to = to.clone()

        let delta = to.clone().subtract(from).normal()
        this.normal = new Vector2(-delta.y, delta.x)
    }

    center() {
        let delta = this.to.clone().subtract(this.from).normal()
        return this.from.clone().add(delta.scale(delta.magnitude() / 2))
    }
}

export class Polygon {
    constructor(points, pos = new Vector2(0, 0)) {
        console.log(points)
        this.points = points;
        this.sides = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.sides.push(new Face(points[i], points[i + 1]))
            console.log(this.sides[i].center())
            console.log(this.sides[i].from)
        }
        this.sides.push(new Face(points[points.length-1], points[0]))

        this.pos = pos
        this.vel = new Vector2(0, 0);
        this.rot = 0;

        this.fillColor// = "rgb(255, 255, 255)"
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

    render(ctx = CanvasRenderingContext2D) {
        ctx.strokeStyle = this.strokeColor;
        ctx.fillStyle = this.fillColor;

        let worldCoords = this.getWorldCoordinates();

        ctx.beginPath();
        ctx.moveTo(worldCoords[0].x, worldCoords[0].y);
        for (let point of worldCoords) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(worldCoords[0].x, worldCoords[0].y);

        // ctx.moveTo(this.pos.x, this.pos.y);
        // ctx.lineTo()

        // ctx.fill()
        ctx.stroke()
    }
}