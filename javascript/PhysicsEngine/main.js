import { Vector2 } from "./Vector2.js";
import * as polyModule from "./Polygon.js"

let newPoly = new polyModule.Polygon([
    new Vector2(-1, 1),
    new Vector2(1, 1),
    new Vector2(1, -1),
    new Vector2(-1, -1)
])

console.log(newPoly)

let vector = new Vector2(1, 1);
let vector2 = new Vector2(5, 3)
