import {vec2, ReadonlyVec2} from "gl-matrix"

export default class SpringNode {

    private _position : vec2;
    get position():ReadonlyVec2 {
        return this._position;
    }
    
    public constructor(x : number, y : number) {
        this._position = vec2.fromValues(x, y);
    }
}