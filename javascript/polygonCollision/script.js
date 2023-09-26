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
    }

    setRotation(degrees) {
        this.r = degrees % 360 * Math.PI / 180
    }

    setRotationDelta(degrees) {
        this.dr = degrees % 360 * Math.PI / 180
    }

    testBounds() {

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

        return { tl: tl, tr: tr, bl: bl, br: br }
    }

    render(ctx) {
        ctx.fillStyle = "rgb(255,0,0)"
        ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3)

        let coords = this.getWorldCoordinates()

        ctx.lineWidth = 1
        ctx.strokeStyle = "rgb(255,255,255)"
        ctx.beginPath();
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + this.w / 2 * Math.cos(this.rotation), this.y + this.y / 2 * Math.sin(this.rotation))

        ctx.moveTo(coords.tl.x, coords.tl.y)
        ctx.lineTo(coords.tr.x, coords.tr.y)
        ctx.lineTo(coords.br.x, coords.br.y)
        ctx.lineTo(coords.bl.x, coords.bl.y)
        ctx.lineTo(coords.tl.x, coords.tl.y)
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
    }
}

const width = 1000
const height = 1000

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width
ctx.canvas.height = height

let boxes = []



let box1 = new Box(width / 2, height / 2, 200, 100, 20, 0, 0, 50)
let box2 = new Box(width / 4, height / 6, 50, 100, 74, 0, 0, -34)

boxes.push(box1)
boxes.push(box2)


let time = 0.0
function loop(t) {
    clearCanvas()
    dt = (t / 1000) - time

    calculatePhysics(dt)

    box1.y = height/2 + 200*Math.sin(time/2)

    box1.render(ctx)
    let box1Points = box1.getWorldCoordinates()
    // let tlnorm = { x: box1Points.tr.x - box1Points.tl.x, y: box1Points.tr.y - box1Points.tl.y }
    let tlnorm = {x:0, y:height}
    box2.render(ctx)
    let box2Points = box2.getWorldCoordinates()

    for (const [pointName, point] of Object.entries(box1Points)) {
        let projPoint = projectVectorToLine(point.x, point.y, tlnorm.x, tlnorm.y)
        let projmag = Math.sqrt(projPoint.x*projPoint.x + projPoint.y*projPoint.y)

        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fillRect(projPoint.x, projPoint.y, 5, 5)

        ctx.fillStyle = "rgb(0, 0, 255)"
        ctx.fillRect(projmag, 0, 5, 5)

        ctx.strokeStyle = "rgb(0, 255, 0)"
        ctx.beginPath()
        ctx.moveTo(projPoint.x, projPoint.y)
        ctx.lineTo(box1Points[pointName].x, box1Points[pointName].y)
        ctx.stroke()
        
        ctx.strokeStyle = "rgb(255, 0, 0)"
        ctx.beginPath()
        ctx.moveTo(projmag, 0)
        ctx.lineTo(box1Points[pointName].x, box1Points[pointName].y)
        ctx.stroke()
    }

    for (const [pointName, point] of Object.entries(box2Points)) {
        let projPoint = projectVectorToLine(point.x, point.y, tlnorm.x, tlnorm.y)
        let projmag = Math.sqrt(projPoint.x*projPoint.x + projPoint.y*projPoint.y)

        ctx.fillStyle = "rgb(255, 0, 0)"
        ctx.fillRect(projPoint.x, projPoint.y, 5, 5)

        ctx.fillStyle = "rgb(255, 0, 255)"
        ctx.fillRect(projmag, 0, 5, 5)

        ctx.strokeStyle = "rgb(0, 255, 0)"
        ctx.beginPath()
        ctx.moveTo(projPoint.x, projPoint.y)
        ctx.lineTo(box2Points[pointName].x, box2Points[pointName].y)
        ctx.stroke()
    
        ctx.strokeStyle = "rgb(255, 0, 0)"
        ctx.beginPath()
        ctx.moveTo(projmag, 0)
        ctx.lineTo(box2Points[pointName].x, box2Points[pointName].y)
        ctx.stroke()
    }

    // newBox.setRotation(newBox.rotation * 180 / Math.PI + 100 * dt)
    // for (box of boxes) {
    //     box.render(ctx)

    //     let points = box.getWorldCoordinates()
    //     let tlnorm = {x: points.tr.x-points.tl.x, y: points.tr.y-points.tl.y}

    //     for (const [pointName, point] of Object.entries(points)) {
    //         let projPoint = projectVectorToLine(point.x, point.y, tlnorm.x, tlnorm.y)
    //         ctx.fillStyle = "rgb(255, 0, 0)"
    //         ctx.fillRect(projPoint.x, projPoint.y, 5, 5)

    //         ctx.strokeStyle = "rgb(0, 255, 0)"
    //         ctx.beginPath()
    //         ctx.moveTo(projPoint.x, projPoint.y)
    //         ctx.lineTo(points[pointName].x, points[pointName].y)
    //         ctx.stroke()
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

