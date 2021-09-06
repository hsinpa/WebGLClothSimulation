import './stylesheet/main.scss';
import SpringMassSystem from './SpringMassSystem/SpringMassSystem';

console.log("Hello world");

let canvasQuery = "#webgl_canvas";
let springMassSystem = new SpringMassSystem(canvasQuery);
springMassSystem.CreateClothMesh(100, 2, 200, 200);