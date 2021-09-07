import {vec2, ReadonlyVec2} from "gl-matrix"
import {SpringNodeType, SpringMassConfig} from './SpringMassStatic'
import {SpringLinkTable} from './SpringMassCloth'
import {GetLinearIndex, GetSpringLinkTableID} from '../Utility/SpringMassUtility';

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
    get gridIndexX() {return this._gridIndexX;}

    private _gridIndexY : number;
    get gridIndexY() {return this._gridIndexY;}

    public isStatic : boolean = false;
    
    private _velocity : vec2;
    private _acceleration : vec2;
    private _externalForce: vec2;

    public constructor(x : number, y : number, index : number, gridIndexX : number, gridIndexY : number, type : SpringNodeType) {
        this._position = vec2.fromValues(x, y);
        this._type = type;

        this._velocity = vec2.fromValues(0,0);
        this._acceleration = vec2.fromValues(0,0);

        this._index = index;
        this._gridIndexX = gridIndexX;
        this._gridIndexY = gridIndexY;
        this.isStatic = type == SpringNodeType.ControlPoint ? true : false;
    }

    public UpdatePosition(x : number, y : number) {
        this._position[0] = x;
        this._position[1] = y;
    }

    public UpdateVelocity(springMassConfig : SpringMassConfig, maxSize : number, lookUpTable : SpringLinkTable) {
        var dampingForce = vec2.create();
        this._acceleration = this.IntegrateForce(maxSize, lookUpTable, springMassConfig);

        //Calculate Damping
        vec2.scale(dampingForce, this._velocity, springMassConfig.damping);
        vec2.sub(this._acceleration, this._acceleration, dampingForce);

        //Currently, only gravity
        this._externalForce = vec2.fromValues(0, springMassConfig.gravity);
        vec2.scale(this._externalForce, this._externalForce, springMassConfig.mass);
        vec2.add(this._acceleration, this._externalForce, this._acceleration);

        let m = 1 / springMassConfig.mass;
        vec2.scale(this._acceleration, this._acceleration, m);

        vec2.scale(this._acceleration, this._acceleration, springMassConfig.timeStep);
        vec2.add(this._velocity, this._velocity, this._acceleration);

        //vec2.scale(this._velocity, this._velocity, this._timeStep);
        vec2.add(this._position, this._position, this._velocity);
    }

    private IntegrateForce(maxSize : number, lookUpTable : SpringLinkTable, springMassConfig : SpringMassConfig) : vec2 {
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

                    let springForce = this.CalSpringForce(this, linkNode, springMassConfig.k, springLink.restLength);

                    vec2.add(this._acceleration, this._acceleration, springForce);
                }
            }
        });
        
        return this._acceleration;
    }

    private CalSpringForce(mainNode : SpringNode, linkNode : SpringNode, k : number, 
                            restLength : number) : vec2 {
        let springForce = vec2.fromValues(0, 0);
        let normalize = vec2.fromValues(0, 0);

        let diff = vec2.sub(springForce, mainNode.position, linkNode.position);
        vec2.normalize(normalize, diff);
        vec2.scale(normalize, normalize, restLength);
        vec2.add(normalize, linkNode.position, normalize);

        let diffAfterNormalize = vec2.sub(normalize, mainNode.position, normalize);
        
        return vec2.scale(springForce, diffAfterNormalize, -k);
    }

}