import SpringNode from "./SpringNode";

export enum SpringNodeType {
    FreePoint = 0,
    ControlPoint,
}

export interface SpringLinkType {
    id : string,
    restLength : number,
    nodes : SpringNode[], //small index will be in front; size 2
}