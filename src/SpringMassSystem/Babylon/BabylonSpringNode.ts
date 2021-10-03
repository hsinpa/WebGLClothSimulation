import Babylon from "babylonjs";
import {SpringNodeType, SpringMassConfig} from '../SpringMassStatic';
import {SpringLinkTable} from './BabylonSpringMass';
import {GetLinearIndex, GetSpringLinkTableID} from '../../Utility/SpringMassUtility';

export default class BabylonSpringNode {

    private _type : SpringNodeType;
    get type():SpringNodeType {
        return this._type;
    }

    private _position : Babylon.Vector3;
    get position():Babylon.Vector3 {
        return this._position;
    }

    private _originalPos : Babylon.Vector3;

    private _offset : Babylon.Vector3;
    get offset():Babylon.Vector3 {
        return this._originalPos.subtractToRef(this._position, this._offset);
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
        this._originalPos = position.clone();
        this._position = position;
        this._type = type;

        this._velocity = Babylon.Vector3.Zero();
        this._acceleration = Babylon.Vector3.Zero();
        this._offset = Babylon.Vector3.Zero();

        this._index = index;
        this._gridIndexX = gridIndexX;
        this._gridIndexY = gridIndexY;
        this.isStatic = type == SpringNodeType.ControlPoint ? true : false;
    }

    public UpdateLocalOffset(offetDelta : Babylon.Vector3) {
        this._position.addInPlace(offetDelta);
    }

    public UpdateVelocity(springMassConfig : SpringMassConfig, maxSize : number, lookUpTable : SpringLinkTable) {
        this._acceleration = this.IntegrateForce(maxSize, lookUpTable, springMassConfig);

        //Calculate Damping
        let dampingForce = this._velocity.scale(springMassConfig.damping);
        this._acceleration = this._acceleration.subtractInPlace(dampingForce);

        //Currently, only gravity
        let externalForce = new Babylon.Vector3(0 , springMassConfig.gravity, 0);
        externalForce = externalForce.scaleToRef(springMassConfig.mass, externalForce);
        this._acceleration = this._acceleration.addInPlace(externalForce);

        let m = 1 / springMassConfig.mass;
        this._acceleration = this._acceleration.scaleInPlace(m);

        //Euler integration
        this._acceleration = this._acceleration.scaleInPlace(springMassConfig.timeStep);
        this._velocity = this._velocity.addInPlace(this._acceleration);

        this._position = this._position.addInPlace(this._velocity);
    }

    private IntegrateForce(maxSize : number, lookUpTable : SpringLinkTable, springMassConfig : SpringMassConfig) : Babylon.Vector3 {
        let acceleration = Babylon.Vector3.Zero();

        let lookUpPossibleSpring = [[0,1], [1, 0], [0, -1], [-1, 0], //Structural Spring
                                    [1,1], [1, -1], [-1, -1], [-1, 1], //Shear Spring
                                    //[0, 2], [2, 0], [0, -2], [-2, 0], //Shear Spring
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
                    acceleration = acceleration.addInPlace(springForce);
                }
            }
        });
        
        return acceleration;
    }

    private CalSpringForce(mainNode : BabylonSpringNode, linkNode : BabylonSpringNode, k : number, 
        restLength : number) : Babylon.Vector3 {

        let restDiff = mainNode.position.subtract(linkNode.position);
        let restDir = restDiff.normalize();
        let restPos = linkNode.position.add( restDir.scaleInPlace(restLength) );

        let springForce = mainNode.position.subtract(restPos);
            springForce.scaleInPlace(-k);

        return springForce;
    }
}