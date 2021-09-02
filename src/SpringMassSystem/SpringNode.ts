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

    private _mass = 10;
    private _k = 10;
    private _velocity : vec2;
    private _acceleration : vec2;
    private _gravity = 30;
    private _timeStep = 0.04;
    private _damping = 100;

    public constructor(x : number, y : number, type : SpringNodeType) {
        this._position = vec2.fromValues(x, y);
        this._type = type;

        this._velocity = vec2.fromValues(0,0);
        this._acceleration = vec2.fromValues(0,0);

        this.isStatic = type == SpringNodeType.ControlPoint ? true : false;
    }

    public UpdatePosition(x : number, y : number) {
        this._position[0] = x;
        this._position[1] = y;
    }

    public UpdateForce(anchorNode : SpringNode) {
        var springForce = vec2.create();
        var dampingForce = vec2.create();
        var force = vec2.create();
        var acceleration = vec2.create();

        vec2.sub(springForce, this._position, anchorNode.position);
        vec2.scale(springForce, springForce, -this._k);

        vec2.scale(dampingForce, this._velocity, this._damping);
        vec2.sub(force, springForce, dampingForce);

        force[1] = force[1] + this._mass * this._gravity;

        let m = 1 / this._mass;
        vec2.scale(acceleration, force, m);
        vec2.scale(acceleration, acceleration, this._timeStep);
        vec2.add(this._velocity, this._velocity, acceleration);
        vec2.add(this._position, this._position, this._velocity);

        // var springForceY = -k*(positionY - anchorY);
        // var dampingForceY = damping * velocityY;
        // var forceY = springForceY + mass * gravity - dampingForceY;
        // var accelerationY = forceY/mass;
    }

}