import {vec2, ReadonlyVec2} from "gl-matrix"
import {SpringNodeType} from './SpringMassStatic'

export default class SpringNode {

    private _type : SpringNodeType;
    get type():SpringNodeType {
        return this._type;
    }

    private _position : vec2;
    get position():ReadonlyVec2 {
        return this._position;
    }

    public isStatic : boolean = false;
    
    public constructor(x : number, y : number, type : SpringNodeType) {
        this._position = vec2.fromValues(x, y);
        this._type = type;

        this.isStatic = type == SpringNodeType.ControlPoint ? true : false;
    }


}