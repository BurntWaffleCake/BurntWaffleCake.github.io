class Box {
    constructor(x = width / 2, y = height / 2, w = 50, h = 50, r = 0, dx = 0, dy = 0, dr = 0) {
        this.x = x //box center x
        this.y = x //box center y
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

    getProjection(lx, ly) {
        let points = this.getWorldCoordinates()
        let tlProj = projectVectorToLine(points[0].x, points[0].y, lx, ly)
        let tlMag = Math.sqrt(tlProj.x * tlProj.x + tlProj.y * tlProj.y)
        let min = tlMag
        let minPoint = points[0]
        let max = tlMag
        let maxPoint = points[0]
        for (let i = 1; i < points.length; i++) {
            let projPoint = projectVectorToLine(points[i].x, points[i].y, lx, ly)
            let pointMag = Math.sqrt(projPoint.x * projPoint.x + projPoint.y * projPoint.y)
            if (pointMag < min) {
                min = pointMag
                minPoint = points[i]
            } else if (pointMag > max) {
                max = pointMag
                maxPoint = points[i]
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
            this.dx = -this.dx
        }

        if (heightProj.maxPoint.y > height || heightProj.minPoint.y < 0) {
            if (heightProj.minPoint.y < 0) {
                this.y -= heightProj.minPoint.y
            } else {
                this.y -= heightProj.maxPoint.y - height
            }
            this.dy = -this.dy
        }
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

function projectVectorToLine(x, y, lx, ly) {
    let dotxl = x * lx + y * ly //dot input vector and plane vector
    let dotll = lx * lx + ly * ly //dot plane vector on itself

    let projX = dotxl / dotll * lx
    let projY = dotxl / dotll * ly
    return { x: projX, y: projY }
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

    }
}

const width = 1000
const height = 1000

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width
ctx.canvas.height = height

let boxes = []

boxes.push(new Box(width / 2, height / 2, 200, 100, 0, 100, 600, 150))
boxes.push(new Box(width / 4, height / 6, 50, 100, 0, -500, 352, -36))


function projectToAxis(axisX, axisY, box, color = "rgb(0, 255, 0)") {
    let axis = { x: axisX, y: axisY }
    let axisMag = Math.sqrt(axis.x * axis.x + axis.y * axis.y)
    axis = { x: axis.x / axisMag, y: axis.y / axisMag }

    let boxProj = box.getProjection(axis.x, axis.y)
    ctx.fillStyle = color
    ctx.fillRect(axis.x * boxProj.max - 2.5, axis.y * boxProj.max - 2.5, 5, 5)
    ctx.fillRect(axis.x * boxProj.min - 2.5, axis.y * boxProj.min - 2.5, 5, 5)
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(axis.x * boxProj.max, axis.y * boxProj.max)
    ctx.lineTo(boxProj.maxPoint.x, boxProj.maxPoint.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(axis.x * boxProj.min, axis.y * boxProj.min)
    ctx.lineTo(boxProj.minPoint.x, boxProj.minPoint.y)
    ctx.stroke()
    return boxProj
}

let time = 0.0
function loop(t) {
    clearCanvas()
    dt = (t / 1000) - time

    calculatePhysics(dt)

    for (let i = 0; i < boxes.length; i++) {
        let box1 = boxes[i]
        for (let n = i+1; n < boxes.length; n++) {
            let box2 = boxes[n]
            if (box1 === box2) { continue }
            let box1ProjY = projectToAxis(0, height, box1)
            let box2ProjY = projectToAxis(0, height, box2)

            let box1ProjX = projectToAxis(width, 0, box1, "rgb(0,255,255)")
            let box2ProjX = projectToAxis(width, 0, box2, "rgb(0,255,255)")

            if (
                (box1ProjY.min < box2ProjY.max && box1ProjY.min > box2ProjY.min ||
                    box1ProjY.max < box2ProjY.max && box1ProjY.max > box2ProjY.min ||
                    box2ProjY.min < box1ProjY.max && box2ProjY.min > box1ProjY.min ||
                    box2ProjY.max < box1ProjY.max && box2ProjY.max > box1ProjY.min
                )
                &&
                (box1ProjX.min < box2ProjX.max && box1ProjX.min > box2ProjX.min ||
                    box1ProjX.max < box2ProjX.max && box1ProjX.max > box2ProjX.min ||
                    box2ProjX.min < box1ProjX.max && box2ProjX.min > box1ProjX.min ||
                    box2ProjX.max < box1ProjX.max && box2ProjX.max > box1ProjX.min
                )
            ) {
                console.log("collided", box1)
                box1.dx = -box1.dx
                box1.dy = -box1.dy
                box2.dx = -box2.dx
                box2.dy = -box2.dy
            }
        }
        box1.render(ctx)
    }


    // let points = box1.getWorldCoordinates()
    // for (let i = 0; i < points.length; i++) {
    //     if (i == points.length - 1) {
    //         projectToAxis(points[points.length - 1].x - points[0].x, points[points.length - 1].y - points[0].y, box1)
    //     } else {
    //         projectToAxis(points[i+1].x - points[i].x, points[i+1].y - points[i].y, box1)
    //     }
    // }
    time = t / 1000
    window.requestAnimationFrame(loop)
}

function startup() {
    console.log("Starting simulation")
    window.requestAnimationFrame(loop)
}

window.addEventListener('load', (event) => {
    startup()
})

