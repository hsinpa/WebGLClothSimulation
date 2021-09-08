import './stylesheet/main.scss';
import SpringMassSystem from './SpringMassSystem/SpringMassSystem';
import {SetDomInputValue} from './Utility/UtilityFunc';

import BabylonCanvas from './SpringMassSystem/Babylon/BabylonCanvas';

let canvasQuery = "#webgl_canvas";
// let springMassSystem = new SpringMassSystem(canvasQuery);
// springMassSystem.CreateClothMesh(200, 6, 200, 200);
// let config = springMassSystem.springCloth.springMassConfig;

// SetDomInputValue("k", (x) => {
//     springMassSystem.springCloth.SetSpringMassConfig({k : x});
// });

// SetDomInputValue("mass", (x) => {
//     springMassSystem.springCloth.SetSpringMassConfig({mass : x});
// });

// SetDomInputValue("gravity", (x) => {
//     springMassSystem.springCloth.SetSpringMassConfig({gravity : x});
// });

// SetDomInputValue("damping", (x) => {
//     springMassSystem.springCloth.SetSpringMassConfig({damping: x});
// });

let babylonCanvas = new BabylonCanvas(canvasQuery);
