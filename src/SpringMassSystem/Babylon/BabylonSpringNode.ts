import {SpringNodeType, SpringMassConfig} from '../SpringMassStatic'
import Babylon from "babylonjs";

export default class BabylonSpringNode {

    private _type : SpringNodeType;
    get type():SpringNodeType {
        return this._type;
    }

    private _position : Babylon.Vector3;
    get position():Babylon.Vector3 {
        return this._position;
    }

    private readonly _index : number;
    get index() : number {
        return this._index;
    }

    private _gridIndexX : number;
    get gridIndexX() {return this._gridIndexX;}

    private _gridIndexY : number;
    get gridIndexY() {return this._gridIndexY;}

    public isStatic : boolean = false;
    
    private _velocity : Babylon.Vector3;
    private _acceleration : Babylon.Vector3;

    public constructor(position : Babylon.Vector3, index : number, gridIndexX : number, gridIndexY : number, type : SpringNodeType) {
        this._position = position;
        this._type = type;

        this._velocity = Babylon.Vector3.Zero();
        this._acceleration = Babylon.Vector3.Zero();

        this._index = index;
        this._gridIndexX = gridIndexX;
        this._gridIndexY = gridIndexY;
        this.isStatic = type == SpringNodeType.ControlPoint ? true : false;
    }
    
}