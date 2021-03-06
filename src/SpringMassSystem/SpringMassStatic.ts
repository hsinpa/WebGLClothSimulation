import SpringNode from "./SpringNode";
import BabylonSpringNode from "./Babylon/BabylonSpringNode";

export enum SpringNodeType {
    FreePoint = 0,
    ControlPoint,
}

export interface SpringLinkType {
    id : string,
    restLength : number,
    nodes : SpringNode[], //small index will be in front; size 2
}

export interface BabylonSpringLinkType {
    id : string,
    restLength : number,
    nodes : BabylonSpringNode[], //small index will be in front; size 2
}

export interface SpringMassConfig {
    mass? : number,
    k? : number, //stiffness
    gravity? : number,
    damping? : number,
    timeStep? : number
}