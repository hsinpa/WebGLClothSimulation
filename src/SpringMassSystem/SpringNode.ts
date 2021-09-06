import {vec2, ReadonlyVec2} from "gl-matrix"
import {SpringNodeType} from './SpringMassStatic'
import {SpringLinkTable} from './SpringMassCloth'
import {GetLinearIndex, GetSpringLinkTableID} from './SpringMassUtility';

export default class SpringNode {

    private _type : SpringNodeType;
    get type():SpringNodeType {
        return this._type;
    }

    private _position : vec2;
    get position():ReadonlyVec2 {
        return this._position;
    }

    private readonly _index : number;
    get index() : number {
        return this._index;
    }

    private _gridIndexX : number;
    private _gridIndexY : number;

    public isStatic : boolean = false;

    private _mass = 5;
    private _k = 7;
    
    private _velocity : vec2;
    private _acceleration : vec2;
    private _externalForce: vec2;

    private _gravity =  10;
    private _timeStep = 0.02;
    private _damping = 30;

    public constructor(x : number, y : number, index : number, gridIndexX : number, gridIndexY : number, type : SpringNodeType) {
        this._position = vec2.fromValues(x, y);
        this._type = type;

        this._velocity = vec2.fromValues(0,0);
        this._acceleration = vec2.fromValues(0,0);
        this._externalForce = vec2.fromValues(0, this._gravity);

        this._index = index;
        this._gridIndexX = gridIndexX;
        this._gridIndexY = gridIndexY;
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

    public UpdateVelocity(maxSize : number, lookUpTable : SpringLinkTable) {
        var dampingForce = vec2.create();
        this._acceleration = this.IntegrateForce(maxSize, lookUpTable);

        //Calculate Damping
        vec2.scale(dampingForce, this._velocity, this._damping);
        vec2.sub(this._acceleration, this._acceleration, dampingForce);

        //Currently, only gravity
        this._externalForce = vec2.fromValues(0, this._gravity);
        vec2.scale(this._externalForce, this._externalForce, this._mass);
        vec2.add(this._acceleration, this._externalForce, this._acceleration);

        let m = 1 / this._mass;
        vec2.scale(this._acceleration, this._acceleration, m);

        vec2.scale(this._acceleration, this._acceleration, this._timeStep);
        vec2.add(this._velocity, this._velocity, this._acceleration);

        //vec2.scale(this._velocity, this._velocity, this._timeStep);
        vec2.add(this._position, this._position, this._velocity);
    }

    private IntegrateForce(maxSize : number, lookUpTable : SpringLinkTable) : vec2 {
        vec2.zero(this._acceleration); // Empty acceleration

        let lookUpPossibleSpring = [[0,1], [1, 0], [0, -1], [-1, 0], //Structural Spring
                                    [1,1], [1, -1], [-1, -1], [-1, 1], //Shear Spring
                                    [0, 2], [2, 0], [0, -2], [-2, 0], //Shear Spring
                                ];
        //console.log("Index " + this.index);

        lookUpPossibleSpring.forEach(offset => {
            let link_gridX = this._gridIndexX + offset[0];
            let link_gridY = this._gridIndexY + offset[1];

            if (link_gridX < maxSize && link_gridY < maxSize && link_gridX >= 0 && link_gridY >= 0) {
                
                let lookUpNodeIndex = GetLinearIndex(link_gridX, link_gridY, maxSize);
                let tableID = GetSpringLinkTableID(this._index, lookUpNodeIndex);

                if (tableID in lookUpTable) {
                    let springLink = lookUpTable[tableID];

                    let linkNode = Math.floor(springLink.nodes[0].index) == Math.floor(this.index) ? springLink.nodes[1] : springLink.nodes[0];
                    //console.log(tableID, this.position, linkNode.position);

                    let springForce = this.CalSpringForce(this, linkNode, this._k, springLink.restLength);

                    vec2.add(this._acceleration, this._acceleration, springForce);
                }
            }
        });
        
        return this._acceleration;
    }

    private CalSpringForce(mainNode : SpringNode, linkNode : SpringNode, k : number, restLength : number) : vec2 {
        let springForce = vec2.fromValues(0, 0);
        let normalize = vec2.fromValues(0, 0);

        let diff = vec2.sub(springForce, mainNode.position, linkNode.position);
        vec2.normalize(normalize, diff);
        vec2.scale(normalize, normalize, restLength);
        vec2.add(normalize, linkNode.position, normalize);

        //console.log(normalize[0], normalize[1], restLength);

        let diffAfterNormalize = vec2.sub(normalize, mainNode.position, normalize);
        
        return vec2.scale(springForce, diffAfterNormalize, -k);
    }

}