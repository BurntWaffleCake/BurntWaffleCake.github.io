class Box {
    constructor(x, y, w, h, rotation = 0.0) {
        this.x = x //box center x
        this.y = x //box center y
        this.w = w //box width
        this.h = h //box height
        this.rotation = rotation % 360 * Math.PI / 180
    }

    setRotation(degrees) {
        this.rotation = degrees % 360 * Math.PI / 180
    }

    render(ctx) {
        ctx.fillStyle = "rgb(0,0,255)"
        ctx.fillRect(this.x - 1.5, this.y - 1.5, 3, 3)
        let hw = this.w/2
        let hh = this.h/2

        let tl = {x: -hw, y: -hh}
        ctx.fillStyle = "rgb(255,0,0)"
        ctx.fillRect(this.x + tl.x - 1.5,this.y + tl.y - 1.5, 3, 3)
        let tlm = Math.sqrt(tl.x*tl.x + tl.y*tl.y)
        let tlr = this.rotation + Math.tan(-tl.y / tl.x) - Math.PI / 4
        tl = {x: this.x + tlm * Math.cos(tlr), y: this.y + tlm * Math.sin(tlr)}
        ctx.fillStyle = "rgb(0,0,255)"
        ctx.fillRect(tl.x - 1.5, tl.y - 1.5, 3, 3)

        let tr = {x: +hw, y: -hh}
        ctx.fillStyle = "rgb(255,0,0)"
        ctx.fillRect(this.x + tr.x - 1.5,this.y + tr.y - 1.5, 3, 3)
        let trm = Math.sqrt(tr.x*tr.x + tr.y*tr.y)
        let trr = this.rotation + Math.tan(-tr.y / tr.x) - Math.PI * 3 / 4
        tr = {x: this.x + trm * Math.cos(trr), y: this.y + trm * Math.sin(trr)}
        ctx.fillStyle = "rgb(0,0,255)"
        ctx.fillRect(tr.x - 1.5, tr.y - 1.5, 3, 3)

        let bl = {x: -hw, y: +hh}
        ctx.fillStyle = "rgb(255,0,0)"
        ctx.fillRect(this.x + bl.x - 1.5,this.y + bl.y - 1.5, 3, 3)
        let blm = Math.sqrt(bl.x*bl.x + bl.y*bl.y)
        let blr = this.rotation + Math.tan(-bl.y / bl.x)
        bl = {x: this.x + blm * Math.cos(blr), y: this.y + blm * Math.sin(blr)}
        ctx.fillStyle = "rgb(0,0,255)"
        ctx.fillRect(bl.x - 1.5, bl.y - 1.5, 3, 3)

        let br = {x: +hw, y: +hh}
        ctx.fillStyle = "rgb(255,0,0)"
        ctx.fillRect(this.x + br.x - 1.5,this.y + br.y - 1.5, 3, 3)
        let brm = Math.sqrt(br.x*br.x + br.y*br.y)
        let brr = this.rotation + Math.tan(-br.y / br.x) - Math.PI * 3 / 4
        br = {x: this.x + brm * Math.cos(brr), y: this.y + brm * Math.sin(brr)}
        ctx.fillStyle = "rgb(0,0,255)"
        ctx.fillRect(br.x - 1.5, br.y - 1.5, 3, 3)

        // let tr = {x: +hw, y: +hh} 
        // let bl = {x: -hw, y: -hh} 
        // let br = {x: +hw, y: +hh} 

        ctx.lineWidth = 1
        ctx.strokeStyle = "rgb(0,0,0)"
        ctx.beginPath();
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(tl.x, tl.y)
        ctx.stroke();
        
        ctx.moveTo(tl.x, tl.y)
        ctx.lineTo(tr.x, tr.y)
        ctx.stroke()
        
    }

}

function startup() {
    console.log("Starting simulation")

    let newBox = new Box(width / 2, height / 2, 50, 50, 10)
    newBox.render(ctx)

    // window.requestAnimationFrame(loop)
}

window.addEventListener('load', (event) => {
    startup()
})

const width = 1000
const height = 1000

const canvas = document.getElementById("source");
const ctx = canvas.getContext("2d");
ctx.canvas.width = width
ctx.canvas.height = height


