    import { Vector2 } from "./Vector2.js";
    import * as polyModule from "./Polygon.js";

    let src = document.getElementById("source");
    let ctx = src.getContext("2d");

    let newPoly = new polyModule.Polygon([
        new Vector2(-50, 50),
        new Vector2(50, 50),
        new Vector2(50, -50),
        new Vector2(-50, -50)
    ])

    let newPoly2 = new polyModule.Polygon([
        new Vector2(-50, 50),
        new Vector2(50, 50),
        new Vector2(50, -50),
        new Vector2(-50, -50)
    ])

    let newPoly3 = new polyModule.Polygon([
        new Vector2(-25, 25),
        new Vector2(25, 25),
        new Vector2(25, -25),
        new Vector2(-25, -25)
    ])


    let vector = new Vector2(1, 1);
    let vector2 = new Vector2(5, 3);

    function render(dt) {
        newPoly.render(ctx);
        newPoly2.render(ctx);
        newPoly3.render(ctx)    
    }

    function calculate(dt, t) {

    }

    let time = 0;
    function loop(t) {
        let dt = (t/1000) - time;

        ctx.canvas.width = src.clientWidth;
        ctx.canvas.height = src.clientHeight;

        newPoly.pos.x = ctx.canvas.width / 2
        newPoly.pos.y = ctx.canvas.height / 2
        newPoly.rot = 150

        newPoly2.pos.x = newPoly.pos.x + 300
        newPoly2.pos.y = newPoly.pos.y

        let objectCoord = newPoly.toObjectSpace(newPoly2.pos)
        console.log(objectCoord)
        newPoly3.pos.x = objectCoord.x
        newPoly3.pos.y = objectCoord.y


        calculate(dt, t);
        render(dt);

        time += t / 1000;
        window.requestAnimationFrame(loop);
    }

    function startup() {
        loop();
    }

    startup();