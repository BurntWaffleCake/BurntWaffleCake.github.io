class Box {
    constructor(x = width / 2, y = height / 2, w = 50, h = 50, r = 0, dx = 0, dy = 0, dr = 0) {
        this.x = x //box center x
        this.y = y //box center y
        this.dx = dx
        this.dy = dy

        this.r = r % 360 * Math.PI / 180 //rotation in radians
        this.dr = dr % 360 * Math.PI / 180 //rotation in radians

        this.w = w //box width
        this.h = h //box height
        this.color = "rgb(255,255,255)"
    }

    setRotation(degrees) {
        this.r = degrees % 360 * Math.PI / 180
    }

    setRotationDelta(degrees) {
        this.dr = degrees % 360 * Math.PI / 180
    }

    projectPoint(x, y, ax, ay) {
        let divResult = (x*ax + y*ay) / (ax*ax + ay+ay)
        let cornerProj = {x: divResult * ax, y: divResult * ay}
        return ax * cornerProj.x + ay * cornerProj.y
    }

    getProjection(lx, ly) {
        let points = this.getWorldCoordinates()
        let minPoint = points[0]
        let min = this.projectPoint(points[0].x, points[0].y, lx, ly)
        let maxPoint = points[0]
        let max = this.projectPoint(points[0].x, points[0].y, lx, ly)

        for (let i = 1; i < points.length; i++) {
            let projection = this.projectPoint(points[i].x, points[i].y, lx, ly)
            if (projection < min) {
                minPoint = points[i]
                min = projection
            } else if (projection > max) {
                maxPoint = points[i]
                max = projection
            }
        }
        
        return { min: min, max: max, minPoint: minPoint, maxPoint: maxPoint }
    }

    testBounds() {
        let widthProj = this.getProjection(width, 0)
        let heightProj = this.getProjection(0, height)

        if (widthProj.maxPoint.x > width || widthProj.minPoint.x < 0) {
            if (widthProj.minPoint.x < 0) {
                this.x -= widthProj.minPoint.x
            } else {
                this.x -= widthProj.maxPoint.x - width
            }
            this.dx = -this.dx * restitution
        }

        if (heightProj.maxPoint.y > height || heightProj.minPoint.y < 0) {
            if (heightProj.minPoint.y < 0) {
                this.y -= heightProj.minPoint.y
            } else {
                this.y -= heightProj.maxPoint.y - height
            }
            this.dy = -this.dy * restitution
        }
    }

    getCollisionAxis() {
        let points = this.getWorldCoordinates()
        let axis1 = { x: points[1].x - points[0].x, y: points[1].y - points[0].y }
        let axis1Mag = Math.sqrt(axis1.x * axis1.x + axis1.y * axis1.y)
        axis1.x = axis1.x / axis1Mag
        axis1.y = axis1.y / axis1Mag

        let axis2 = { x: points[2].x - points[1].x, y: points[2].y - points[1].y }
        let axis2Mag = Math.sqrt(axis2.x * axis2.x + axis2.y * axis2.y)
        axis2.x = axis2.x / axis2Mag
        axis2.y = axis2.y / axis2Mag

        // let axis3 = { x: points[3].x - points[2].x, y: points[3].y - points[2].y }
        // let axis3Mag = Math.sqrt(axis3.x * axis3.x + axis3.y * axis3.y)
        // axis3.x = axis3.x / axis3Mag
        // axis3.y = axis3.y / axis3Mag

        // let axis4 = { x: points[0].x - points[3].x, y: points[0].y - points[3].y }
        // let axis4Mag = Math.sqrt(axis4.x * axis4.x + axis4.y * axis4.y)
        // axis4.x = axis4.x / axis4Mag
        // axis4.y = axis4.y / axis4Mag
        return [axis1, axis2]//, axis3, axis4]
    }

    getWorldCoordinates() {
        let hw = this.w / 2
        let hh = this.h / 2

        let tl = { x: -hw, y: -hh }
        let tlm = Math.sqrt(tl.x * tl.x + tl.y * tl.y)
        let tlr = this.r + Math.PI - Math.atan(-tl.y / tl.x)
        tl = { x: this.x + tlm * Math.cos(tlr), y: this.y + tlm * Math.sin(tlr) }


        let tr = { x: +hw, y: -hh }
        let trm = Math.sqrt(tr.x * tr.x + tr.y * tr.y)
        let trr = this.r - Math.atan(-tr.y / tr.x)
        tr = { x: this.x + trm * Math.cos(trr), y: this.y + trm * Math.sin(trr) }

        let bl = { x: -hw, y: +hh }
        let blm = Math.sqrt(bl.x * bl.x + bl.y * bl.y)
        let blr = this.r + Math.PI - Math.atan(-bl.y / bl.x)
        bl = { x: this.x + blm * Math.cos(blr), y: this.y + blm * Math.sin(blr) }

        let br = { x: +hw, y: +hh }
        let brm = Math.sqrt(br.x * br.x + br.y * br.y)
        let brr = this.r - Math.atan(-br.y / br.x)
        br = { x: this.x + brm * Math.cos(brr), y: this.y + brm * Math.sin(brr) }

        return [tl, tr, br, bl]
    }

    render(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3)

        let coords = this.getWorldCoordinates()

        ctx.lineWidth = 1
        ctx.strokeStyle = this.color
        ctx.beginPath();
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + this.w / 2 * Math.cos(this.rotation), this.y + this.h / 2 * Math.sin(this.rotation))

        ctx.moveTo(coords[0].x, coords[0].y)
        for (let i = 0; i < coords.length; i++) {
            ctx.lineTo(coords[i].x, coords[i].y)
        }
        ctx.lineTo(coords[0].x, coords[0].y)
        ctx.stroke()
    }
}

function testProjectionOverlap(proj1, proj2) {
    let overlap = Math.max(0, Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min))

    if (overlap > 0) {
        return overlap
    }
    return false
}

function projectVectorToLine(x, y, lx, ly) {
    let dotxl = x * lx + y * ly //dot input vector and plane vector
    let dotll = lx * lx + ly * ly //dot plane vector on itself

    let projX = dotxl / dotll * lx
    let projY = dotxl / dotll * ly
    return { x: projX, y: projY }
}

function projectToAxis(axisX, axisY, box, color) {
    let axis = { x: axisX, y: axisY }
    let axisMag = Math.sqrt(axis.x * axis.x + axis.y * axis.y)
    axis = { x: axis.x / axisMag, y: axis.y / axisMag }
    let boxProj = box.getProjection(axis.x, axis.y)

    if (color != undefined) {
        // ctx.fillStyle = color
        // ctx.fillRect(axis.x * boxProj.max - 2.5, axis.y * boxProj.max - 2.5, 5, 5)
        // ctx.fillRect(axis.x * boxProj.min - 2.5, axis.y * boxProj.min - 2.5, 5, 5)
        // ctx.strokeStyle = color
        // ctx.beginPath()
        // ctx.moveTo(axis.x * boxProj.max, axis.y * boxProj.max)
        // ctx.lineTo(boxProj.maxPoint.x, boxProj.maxPoint.y)
        // ctx.stroke()
        // ctx.beginPath()
        // ctx.moveTo(axis.x * boxProj.min, axis.y * boxProj.min)
        // ctx.lineTo(boxProj.minPoint.x, boxProj.minPoint.y)
        // ctx.stroke()
    }
    return boxProj
}

function testBoxCollision(box1, box2) {
    let satAxis = box1.getCollisionAxis()
    let satAxis2 = box2.getCollisionAxis()
    satAxis = satAxis.concat(box2.getCollisionAxis())

    var colliding = true

    let mvt = Number.MAX_VALUE
    let normal = undefined

    // ctx.strokeStyle = "rgb(0,255,0)"

    for (axis of satAxis) {
        // ctx.moveTo(width / 2, height / 2)
        // ctx.lineTo(width / 2 + 50 * axis.x, height / 2 + 50 * axis.y)

        let box1Proj = projectToAxis(axis.x, axis.y, box1)
        let box2Proj = projectToAxis(axis.x, axis.y, box2)

        let overlap = testProjectionOverlap(box1Proj, box2Proj)

        if (!overlap) {
            colliding = false
        } else if (overlap < mvt) {
            mvt = overlap
            normal = axis
        }

        // ctx.fillStyle = box1.color
        // ctx.fillRect(box1Proj.max * axis.x / 2 + width / 2 - 1.5, box1Proj.max * axis.y / 2 + height / 2 - 1.5, 3, 3)
        // ctx.fillRect(box1Proj.min * axis.x / 2 + width / 2 - 1.5, box1Proj.min * axis.y / 2 + height / 2 - 1.5, 3, 3)

        // ctx.fillStyle = box2.color
        // ctx.fillRect(box2Proj.max * axis.x / 2 + width / 2 - 1.5, box2Proj.max * axis.y / 2 + height / 2 - 1.5, 3, 3)
        // ctx.fillRect(box2Proj.min * axis.x / 2 + width / 2 - 1.5, box2Proj.min * axis.y / 2 + height / 2 - 1.5, 3, 3)
       
    }

    ctx.stroke()

    if (colliding) {
        // box2.color = "rgb(255,0,255)"
        let dot = normal.x * (box2.x - box1.x) + normal.y * (box2.y - box1.y)
        
        // ctx.beginPath()
        // ctx.strokeStyle = "rgb(0,0,255)"
        // ctx.moveTo(width / 2, height / 2)
        // ctx.lineTo(width / 2 + 50 * normal.x, height / 2 + 50 * normal.y)
        
        // ctx.moveTo(box1.x, box1.y)
        // ctx.lineTo(box1.x + normal.x * mvt, box1.y + normal.y * mvt)

        if (dot < 0) {
            normal.x = -normal.x
            normal.y = -normal.y
        }

        ctx.beginPath()
        ctx.moveTo(box1.x, box1.y)
        ctx.lineTo(box1.x + mvt*normal.x, box1.y + mvt*normal.y)
        ctx.stroke()
        // ctx.font = "24px Arial";
        // ctx.fillText(`${dot}`, box1.x + 15, box1.y - 15);

        // ctx.beginPath()
        // ctx.strokeStyle = "rgb(255,0,255)"
        // ctx.moveTo(width / 2, height / 2)
        // ctx.lineTo(width / 2 + 50 * normal.x, height / 2 + 50 * normal.y)
        
        // ctx.moveTo(box1.x, box1.y)
        // ctx.lineTo(box1.x + normal.x * mvt, box1.y + normal.y * mvt)

        // ctx.stroke()

        return {colliding: true, mtx: mvt, normal: normal}
    } else {
        box2.color = "rgb(255,255,255)"
        return {colliding: false}
    }
}

function resolveCollision(box1, box2, mvt, normal) {
    box1.x -= mvt / 2 * normal.x
    box1.y -= mvt / 2 * normal.y

    box2.x += mvt / 2 * normal.x
    box2.y += mvt / 2 * normal.y

    let relVelx = box2.dx - box1.dx
    let relVely = box2.dy - box1.dy

    let velNorm = normal.x * relVelx + normal.y * relVely
    if (velNorm > 0)
        return;

    var j = -(1 + restitution) * velNorm
    let inverseMassSum = (1 / (box1.h*box1.w) + 1 / (box2.h*box2.w))
    j = j / inverseMassSum

    box1.dx -= normal.x * j / (box1.h*box1.w)
    box1.dy -= normal.y * j / (box1.h*box1.w)
    box2.dx += normal.x * j / (box2.h*box2.w)
    box2.dy += normal.y * j / (box2.h*box2.w)
}

function clearCanvas() {
    ctx.clearRect(0, 0, width, height)
}

function calculatePhysics(dt) {
    for (box of boxes) {
        box.x += box.dx * dt
        box.y += box.dy * dt
        box.r += box.dr * dt
        box.testBounds()
        // box.dy += gravity * dt
    }
}

const width = 1000
const height = 1000
const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width
ctx.canvas.height = height

let boxes = []

const gravity = 1000
const restitution = 0

// boxes.push(new Box(width / 2, height / 2, 200, 100, 24, 100, 300, 30))
// boxes.push(new Box(width / 4, height / 4, 200, 300, -76, 0, 0, -50))

let time = 0.0
function loop(t) {
    clearCanvas()
    dt = (t / 1000) - time

    if (mouse1Down) {
        let point = getMousePos(canvas, mousePos)
        let closestBox = boxes[0]
        let distance = Math.sqrt((point.x - closestBox.x)**2 + (point.y - closestBox.y)**2)
        for (let i = 1; i < boxes.length; i++) {
            let nextBox = boxes[i]
            let nextDistance = Math.sqrt((point.x - nextBox.x)**2 + (point.y - nextBox.y)**2)
            if (nextDistance < distance) {
                closestBox = nextBox
                distance = nextDistance
            } 
        }
        closestBox.x = point.x
        closestBox.y = point.y
    }

    calculatePhysics(dt)

    for (let i = 0; i < boxes.length; i++) {
        let box1 = boxes[i]
        for (let n = i + 1; n < boxes.length; n++) {
            let box2 = boxes[n]

            let result = testBoxCollision(box1, box2)
            if (result.colliding) {
                console.log("collided")
                resolveCollision(box1, box2, result.mtx, result.normal)
            }
        }
    }
    
    for (box of boxes) {
        box.render(ctx)
    }

    time = t / 1000
    window.requestAnimationFrame(loop)
}

function startup() {
    console.log("Starting simulation")

    for (let i = 0; i < 10; i++) {
        boxes.push(new Box(
            Math.random() * width, 
            Math.random() * height, 
            25 + Math.random() * 75, 
            25 + Math.random() * 75, 
            360 * Math.random(), 
            150 - Math.random()*300, 
            150 - Math.random()*300, 
            150 - Math.random()*300))
    }

    window.requestAnimationFrame(loop)
}

window.addEventListener('load', (event) => {
    startup()
})

function getMousePos(canvas, point) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (point.x - rect.left) / rect.width * width,
        y: (point.y - rect.top) / rect.height * height
    };
}

let mouse1Down = false
let mousePos = { x: 0, y: 0 }

document.addEventListener('mousedown', (event) => {
    console.log("mousedown")
    if (event.buttons == 1) {
        mouse1Down = true
    }
})
document.addEventListener('mouseup', (event) => {
    if (event.buttons == 0) {
        mouse1Down = false
    }
})

canvas.addEventListener('mousemove', (event) => {
    mousePos.x = event.clientX
    mousePos.y = event.clientY
})
