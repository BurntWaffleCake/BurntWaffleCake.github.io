export class Node {
  constructor(radius = 10, x, y, dx = 0, dy = 0, mass = 1) {
    this.radius = radius;
    this.pinned = false;
    this.pos = { x: x, y: y };
    this.posPrev = { x: x - dx, y: y - dy };
    this.a = { x: dx, y: dy };
    this.mass = mass;
    this.groundFriction = 0.7;
    this.selectable = true;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    if (this.pinned) {
      ctx.strokeStyle = "rgb(0,0,255)";
      ctx.fillStyle = "rgb(0,0,255)";
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = "rgb(0,0,0)";
      ctx.stroke();
    }
  }

  constrain(width, height) {
    if (this.pos.x < this.radius) {
      this.pos.x = this.radius;
    }

    if (this.pos.y < this.radius) {
      this.pos.y = this.radius;
    }

    if (this.pos.x > width - this.radius) {
      this.pos.x = width - this.radius;
    }

    if (this.pos.y > height - this.radius) {
      this.pos.y = height - this.radius;
    }
  }

  tick(dt, ctx) {
    if (this.pinned) {
      return;
    }
    let Velx = this.pos.x - this.posPrev.x; // + this.a.x * dt ** 2;
    let Vely = this.pos.y - this.posPrev.y; // + this.a.y * dt ** 2;

    if (this.pos.y >= ctx.canvas.height - this.radius && Velx ** 2 + Vely ** 2 > 0.000001) {
      var m = Math.sqrt(Velx ** 2 + Vely ** 2);
      Velx /= m;
      Velx *= m * this.groundFriction;
      Vely /= m;
      Vely *= m * this.groundFriction;
    }

    // this.pos.x += this.pos.x - this.posPrev.x;
    // this.pos.y += this.pos.y - this.posPrev.y;

    this.posPrev.x = this.pos.x;
    this.posPrev.y = this.pos.y;

    this.pos.x += Velx;
    this.pos.y += Vely;
  }
}

export class Link {
  constructor(nodeA, nodeB, length, stiffness = 0.5) {
    this.a = nodeA;
    this.b = nodeB;
    this.stiffness = stiffness;
    this.visible = true;
    if (!length || typeof length != "number") {
      this.length = Math.sqrt((this.a.pos.x - this.b.pos.x) ** 2 + (this.a.pos.y - this.b.pos.y) ** 2);
    } else {
      this.length = length;
    }
  }

  tick(dt) {
    let dx = this.b.pos.x - this.a.pos.x;
    let dy = this.b.pos.y - this.a.pos.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (Math.abs(dist) < 0.001) {
      dist = 0.001;
      this.a.pos.x += 0.001;
      this.b.pos.x -= 0.001;
    }

    let diff = ((this.length - dist) / dist) * this.stiffness;

    let offsetx = dx * diff * 0.5;
    let offsety = dy * diff * 0.5;

    // calculate mass
    let m1 = this.a.mass + this.b.mass;
    let m2 = this.a.mass / m1;
    m1 = this.b.mass / m1;

    // and finally apply the offset with calculated mass
    if (!this.a.pinned) {
      this.a.pos.x -= offsetx * m1;
      this.a.pos.y -= offsety * m1;
    }
    if (!this.b.pinned) {
      this.b.pos.x += offsetx * m2;
      this.b.pos.y += offsety * m2;
    }
  }

  render(ctx) {
    if (!this.visible) {
      return;
    }
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.moveTo(this.a.pos.x, this.a.pos.y);
    ctx.lineTo(this.b.pos.x, this.b.pos.y);
    ctx.stroke();
  }
}

export class Collection {
  constructor(nodes = [], links = []) {
    this.nodes = nodes;
    this.links = links;
  }
}
