import Babylon from "babylonjs";
import BabylonMesh, {TrigIndexLookTable} from "./BabylonMesh";
import BabylonSpringNode from './BabylonSpringNode';
import {BabylonSpringLinkType, SpringMassConfig, SpringNodeType} from '../SpringMassStatic';
import {GetLinearIndex, GetSpringLinkTableID, ShuffleArray} from '../../Utility/SpringMassUtility';

export interface SpringLinkTable {
    [id: string] : BabylonSpringLinkType
}

export default class BabylonSpringMass {

    public _springNodeArray : BabylonSpringNode[] = [];
    private  _springLinkTable : SpringLinkTable;
    private _subdivide : number;

    public controlNodeArray : BabylonSpringNode[] = [];

    constructor(subdivide : number) {
        this._subdivide = subdivide;
    }

    public PushNode(node : BabylonSpringNode) {
        this._springNodeArray.push(node);

        if (node.type == SpringNodeType.ControlPoint)
            this.controlNodeArray.push(node);
    }

    public UpdatePhysics(config : SpringMassConfig, trigLookupTable : TrigIndexLookTable) {
        let offsetArray : Array<number> = new Array(this._springNodeArray.length*3);

        let nodeLength = this._springNodeArray.length;

        let cacheVector : Babylon.Vector3;

        for (let i = 0; i < nodeLength; i++) {
            if (i in trigLookupTable) {
                let vertexIndex = trigLookupTable[i];
                if (this._springNodeArray[i].isStatic) {
                    cacheVector =(this._springNodeArray[i].offset); 
                } else {
                    this._springNodeArray[i].UpdateVelocity(config, this._subdivide+1, this._springLinkTable);
                    cacheVector = (this._springNodeArray[i].offset);   
                }

                let base = vertexIndex * 3;

                //console.log(base +", " + cacheVector);
                offsetArray[base] = cacheVector.x;
                offsetArray[base+1] = cacheVector.y;
                offsetArray[base+2] = cacheVector.z;
            }
        }

        return offsetArray;
    }
    
    public GenerateSpringLink(subdivide : number) : SpringLinkTable {
        this._springLinkTable = {};
        let nodeLen = this._springNodeArray.length;
        let size = subdivide + 1;
        //console.log(size);
        for (let i = 0; i < nodeLen; i++) {
            let gridX = i % (size);
            let gridY = Math.floor(i / (size));

            //Structural Links
            this.SetSpringLinkToTable(this._springLinkTable, this.FindSpring(this._springNodeArray[i], i, gridX, gridY, size, this._springNodeArray, [[1, 0], [0, 1]]));

            //Shear Links
            this.SetSpringLinkToTable(this._springLinkTable, this.FindSpring(this._springNodeArray[i], i, gridX, gridY, size, this._springNodeArray,  [[-1, 1], [1, 1]]));

            //Flexion Links
            this.SetSpringLinkToTable(this._springLinkTable, this.FindSpring(this._springNodeArray[i], i, gridX, gridY, size, this._springNodeArray,  [[2, 0], [0, 2]]));
        }

        console.log(this._springLinkTable);

        return this._springLinkTable;
    }

    private FindSpring(node : BabylonSpringNode, index : number, gridX : number, gridY:number, maxSize : number, 
                    set : BabylonSpringNode[], possibleIndexSet : number[][]) : BabylonSpringLinkType[] {
        let links : BabylonSpringLinkType[] = [];

        possibleIndexSet.forEach(s => {
            let link_gridX = gridX + s[0];
            let link_gridY = gridY + s[1];

            if (link_gridX < maxSize && link_gridY < maxSize && link_gridX >= 0 && link_gridY >= 0) {
                let arrayIndex = GetLinearIndex(link_gridX, link_gridY, maxSize);

                let linkNode = set[arrayIndex];
                let restLength = Babylon.Vector3.Distance(node.position, linkNode.position);

                let linkType  : BabylonSpringLinkType= { id : GetSpringLinkTableID(index, arrayIndex), restLength : restLength, nodes : [node, linkNode] };
                // console.log(linkType.id +", rest " + linkType.restLength);
                links.push(linkType);
            }
        });

        return links;
    }

    private SetSpringLinkToTable(linkTable : SpringLinkTable, linkTypes: BabylonSpringLinkType[]) {
        linkTypes.forEach(l => {
            if (!(l.id in linkTable)) {
                linkTable[l.id] = l;
            }
        });

        return linkTable;
    }

}