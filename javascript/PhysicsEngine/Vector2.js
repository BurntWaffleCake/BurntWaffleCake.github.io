export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normal() {
        let mag = this.magnitude()
        return new Vector2(this.x / mag, this.y / mag);
    }

    magnitude() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    multiply(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;

    }

    divide(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;

    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y)
    }

    dot(vector) {
        return this.x*vector.x + this.y*vector.y
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x
    }
}