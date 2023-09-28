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
        this.m = w * h //mass
        this.color = "rgb(255,255,255)"
        this.i = 1 / 12 * this.m * (w * w + h * h)
    }

    setRotation(degrees) {
        this.r = degrees % 360 * Math.PI / 180
    }

    setRotationDelta(degrees) {
        this.dr = degrees % 360 * Math.PI / 180
    }

    projectPoint(x, y, ax, ay) {
        let divResult = (x * ax + y * ay) / (ax * ax + ay + ay)
        let cornerProj = { x: divResult * ax, y: divResult * ay }
        return ax * cornerProj.x + ay * cornerProj.y
    }

    getClosestPoint(x, y) {
        let points = this.getWorldCoordinates()
        let closestPoint = points[0]
        let dis = Math.sqrt((x - closestPoint.x) ** 2 + (y - closestPoint.y) ** 2)

        for (let i = 1; i < points.length; i++) {
            let nextPoint = points[i]
            let newDis = Math.sqrt((x - nextPoint.x) ** 2 + (y - nextPoint.y) ** 2)
            if (newDis < dis) {
                closestPoint = nextPoint
                dis = newDis
            }
        }
        return { point: closestPoint, distance: dis }
    }

    getCoordinates() {
        let hw = this.w / 2
        let hh = this.h / 2

        let tl = { x: -hw, y: -hh }
        let tr = { x: +hw, y: -hh }
        let br = { x: +hw, y: +hh }
        let bl = { x: -hw, y: +hh }

        return [tl, tr, br, bl]
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

    toWorldSpace(x, y) {
        return {
            x: this.x + x * Math.cos(this.r) - y * Math.sin(this.r),
            y: this.y + x * Math.sin(this.r) + y * Math.cos(this.r),
        }
    }

    getWorldCoordinates() {
        let hw = this.w / 2
        let hh = this.h / 2

        let tl = this.toWorldSpace(-hw, -hh)// { x: -hw, y: -hh }
        let tr = this.toWorldSpace(hw, -hh)
        let bl = this.toWorldSpace(-hw, hh)
        let br = this.toWorldSpace(hw, hh)

        return [tl, tr, br, bl]
    }

    render(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3)

        let coords = this.getWorldCoordinates()

        ctx.strokeStyle = this.color
        ctx.beginPath();
        ctx.moveTo(coords[0].x, coords[0].y)
        for (let i = 0; i < coords.length; i++) {
            ctx.lineTo(coords[i].x, coords[i].y)
        }
        ctx.lineTo(coords[0].x, coords[0].y)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        let foward = this.toWorldSpace(this.w / 2, 0)
        ctx.lineTo(foward.x, foward.y)
        ctx.stroke()

    }
}

function getCollidingPoint(box1, box2, normal) {
    let mag = Math.sqrt((box2.x - box1.x) ** 2 + (box2.y - box1.y) ** 2)
    let delta = { x: (box2.x - box1.x) / mag, y: (box2.y - box1.y) / mag }

    ctx.beginPath()
    ctx.moveTo(box1.x, box1.y)
    ctx.lineTo(box1.x + delta.x / 2 * mag, box1.y + delta.y / 2 * mag)
    ctx.stroke()

    let box1Coords = box1.getCoordinates()
    let box2Coords = box2.getCoordinates()

    let maxPoint = box1.toWorldSpace(box1Coords[0].x, box1Coords[0].y)
    let maxPointMag = Math.sqrt(maxPoint.x * maxPoint.x + maxPoint.y * maxPoint.y)
    let maxDot = delta.x * (box1Coords[0].x / maxPointMag) + delta.y * (box1Coords[0].y / maxPointMag)

    ctx.fillText(String(maxDot), maxPoint.x, maxPoint.y)

    console.log(maxDot)

    for (let i = 1; i < box1Coords.length; i++) {
        let point = box1Coords[i]
        let worldPoint = box1.toWorldSpace(point.x, point.y)
        let pointMag = Math.sqrt(point.x*point.x + point.y*point.y)
        let norm = {x: point.x/pointMag, y: point.y/pointMag}

        let dot = delta.x*norm.x + delta.y*norm.y

        if (dot > maxDot) {
            maxDot = dot
            maxPoint = worldPoint
        }

        ctx.fillText(String(dot), worldPoint.x, worldPoint.y)
    }

    for (point of box2Coords) {
        let worldPoint = box2.toWorldSpace(point.x, point.y)
        let pointMag = Math.sqrt(point.x*point.x + point.y*point.y)
        let norm = {x: point.x/pointMag, y: point.y/pointMag}

        let dot = -delta.x*norm.x + -delta.y*norm.y

        if (dot < maxDot) {
            maxDot = dot
            maxPoint = worldPoint
        }

        ctx.fillText(String(dot), worldPoint.x, worldPoint.y)
    }
    return maxPoint
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

    // ctx.stroke()

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
        ctx.lineTo(box1.x + mvt * normal.x, box1.y + mvt * normal.y)
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

        return { colliding: true, mtx: mvt, normal: normal }
    } else {
        box2.color = "rgb(255,255,255)"
        return { colliding: false }
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
    let inverseMassSum = (1 / (box1.m) + 1 / (box2.m))
    j = j / inverseMassSum

    box1.dx -= normal.x * j / (box1.m)
    box1.dy -= normal.y * j / (box1.m)
    box2.dx += normal.x * j / (box2.m)
    box2.dy += normal.y * j / (box2.m)
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
        box.dy += gravity * dt
    }
}

const width = 1000
const height = 1000
const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width
ctx.canvas.height = height

let boxes = []

const gravity = 0
const restitution = 1

let time = 0.0
function loop(t) {
    dt = (t / 1000) - time

    clearCanvas()
    if (mouse1Down) {
        // for (box of boxes) {
        //     let point = getMousePos(canvas, mousePos)
        //     let delta = { x: point.x - box.x, y: point.y - box.y }
        //     box.dx += delta.x* 10 * dt
        //     box.dy += delta.y* 10 * dt
        // }

        let point = getMousePos(canvas, mousePos)
        let closestBox = boxes[0]
        let distance = Math.sqrt((point.x - closestBox.x) ** 2 + (point.y - closestBox.y) ** 2)
        for (let i = 1; i < boxes.length; i++) {
            let nextBox = boxes[i]
            let nextDistance = Math.sqrt((point.x - nextBox.x) ** 2 + (point.y - nextBox.y) ** 2)
            if (nextDistance < distance) {
                closestBox = nextBox
                distance = nextDistance
            }
        }
        closestBox.x = point.x
        closestBox.y = point.y

        closestBox.dx = mouseDelta.x * 50
        closestBox.dy = mouseDelta.y * 50
    }

    for (let c = 0; c < 1; c++) {
        let cdt = dt / 1
        // calculatePhysics(cdt)

        for (let i = 0; i < boxes.length; i++) {
            let box1 = boxes[i]
            for (let n = i + 1; n < boxes.length; n++) {
                let box2 = boxes[n]

                let result = testBoxCollision(box1, box2)
                if (result.colliding) {
                    // console.log("collided")

                    let collisionPoint = getCollidingPoint(box1, box2)
                    ctx.fillStyle = "rgb(255, 0, 0)"
                    ctx.fillRect(collisionPoint.x - 5, collisionPoint.y - 5, 10, 10)
                    // resolveCollision(box1, box2, result.mtx, result.normal)
                }
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

    for (let i = 0; i < 2; i++) {
        boxes.push(new Box(
            Math.random() * width,
            Math.random() * height,
            100 + Math.random() * 75,
            100 + Math.random() * 75,
            360 * Math.random(),
            150 - Math.random() * 300,
            150 - Math.random() * 300,
            150 - Math.random() * 300))
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
let mouseDelta = { x: 0, y: 0 }

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
    mouseDelta.x = event.movementX
    mouseDelta.y = event.movementY
})
