export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normal() {
        let mag = this.magnitude()
        return new Vector2(this.x / mag, this.y / mag);
    }

    normalize() {
        let mag = this.magnitude()
        this.x = this.x / mag
        this.y = this.y / mag
        return this
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    rotate(rad) {
        this.x = this.x * Math.cos(rad) - this.y * Math.sin(rad)
        this.y = this.x * Math.sin(rad) + this.y * Math.cos(rad)
        return this
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

    projectToAxis(axis) {
        return ((this.x * axis.x + this.y * axis.y) / (axis.x * axis.x + axis.y * axis.y)) * axis.x
             + ((this.x * axis.x + this.y * axis.y) / (axis.x * axis.x + axis.y * axis.y)) * axis.y
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x
    }

    set(x, y) {
        this.x = x
        this.y = y
    }
}