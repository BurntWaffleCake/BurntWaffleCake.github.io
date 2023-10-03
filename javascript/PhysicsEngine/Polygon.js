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
    constructor(points) {
        console.log(points)
        this.points = points;
        this.sides = [];
        for (let i = 0; i < points.length - 1; i++) {
            this.sides.push(new Face(points[i], points[i + 1]))
            console.log(this.sides[i].center())
            console.log(this.sides[i].from)
        }
        this.sides.push(new Face(points[points.length-1], points[0]))
    }
}