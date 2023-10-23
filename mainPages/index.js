const heightRatio = 0.5
const canvas = document.getElementById("background-effect")
const ctx = canvas.getContext("2d")
const content = document.getElementById("about-me-content")

let ratio = 0

let resolution = 25

function clearCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}


function drawFrame() {
    clearCanvas()

    let size = ctx.canvas.width / 30
    let t = content.scrollTop / 1000 + .5
    for (let i = 0; i<resolution; i++) {
        let ti = t + i * 5 / resolution
        let x = ctx.canvas.width / resolution * i
        let y = ctx.canvas.height / 2 + Math.sin(ti) * ctx.canvas.height / 3

        ctx.fillStyle = "#111111"
        ctx.fillRect(x, y, size, size)
    }

    for (let i = 0; i<resolution; i++) {
        let ti = t + i * 5 / resolution
        let x = ctx.canvas.width / resolution * i
        let y = ctx.canvas.height / 2 + Math.sin(-ti) * ctx.canvas.height / 3

        ctx.fillStyle = "#202020"
        ctx.fillRect(x, y, size, size)
    }
}

function getScrollRatio() {
    var h = content,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight';
    return (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight);
}

function resizeCanvas() {
    ctx.canvas.width = canvas.clientWidth
    ctx.canvas.height = canvas.clientHeight
    clearCanvas()
    drawFrame()
}

content.addEventListener('scroll', (event) => {
    ratio = getScrollRatio()
    drawFrame()
})

window.addEventListener("resize", (event) => {
    console.log(event)
    resizeCanvas()
})
resizeCanvas()



