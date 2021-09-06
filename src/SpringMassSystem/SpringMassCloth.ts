import SpringNode from "./SpringNode";
import {SpringNodeType, SpringLinkType} from './SpringMassStatic';
import { vec2 } from "gl-matrix";
import {GetLinearIndex, GetSpringLinkTableID} from './SpringMassUtility';

export interface SpringLinkTable {
    [id: string] : SpringLinkType
} 

export default class SpringCloth {

    private _nodes : SpringNode[];

    get nodeLength() : number {
        return this._nodes.length;
    }

    get nodes() : SpringNode[] {
        return this._nodes;
    }

    private _width: number;
    private _height : number;
    private _subdivide : number;
    private _springNatureLength : number;
    private _springLinkLookupTable : SpringLinkTable;
    
    public constructor(size : number, subdivide : number, startPointX : number, startPointY: number) {
        this._width = size;
        this._height = size;
        this._subdivide = subdivide;
        this._springNatureLength = size / subdivide;

        this._nodes = this.CreateClothNodes(startPointX, startPointY, subdivide, this._springNatureLength);
        this._springLinkLookupTable = this.GenerateSpringLink();

        console.log(this._springLinkLookupTable);
    }

    public Update() {
        let l = this._nodes.length;

        for (let i = 0; i < l; i++) {
            if (this._nodes[i].isStatic) continue;
        }
    }

    private CreateClothNodes( startPointX : number, startPointY: number, subdivide : number, springNatureLength : number) : SpringNode[] {
        let nodes : SpringNode[] = [];

        for (let y = 0; y <= subdivide; y++) {
            for (let x = 0; x <= subdivide; x++) {
                let type : SpringNodeType = ((y == 0 && x == 0) || (y == 0 && x == subdivide-1)) ? SpringNodeType.ControlPoint : SpringNodeType.FreePoint;
                
                let posX = startPointX + (x * springNatureLength);
                let posY = startPointY + (y * springNatureLength); // Javascript canvas + means down;

                let index = GetLinearIndex(x, y, subdivide+1);

                nodes.push(new SpringNode(posX, posY, index, x, y, type));
            }
        }

        return nodes;
    }

    private GenerateSpringLink() : SpringLinkTable {
        let table : SpringLinkTable = {};
        let nodeLen = this.nodeLength;
        let size = this._subdivide + 1;

        for (let i = 0; i < nodeLen; i++) {
            let gridX = i % (size);
            let gridY = Math.floor(i / (size));

            //Structural Links
            this.SetSpringLinkToTable(table, this.FindSpring(this._nodes[i], i, gridX, gridY, size, this._nodes, [[1, 0], [0, 1]]));

            // //Shear Links
            this.SetSpringLinkToTable(table, this.FindSpring(this._nodes[i], i, gridX, gridY, size, this._nodes,  [[-1, 1], [1, 1]]));

            // //Flexion Links
            this.SetSpringLinkToTable(table, this.FindSpring(this._nodes[i], i, gridX, gridY, size, this._nodes,  [[2, 0], [0, 2]]));
        }

        return table;
    }

    private FindSpring(node : SpringNode, index : number, gridX : number, gridY:number, maxSize : number, 
                    set : SpringNode[], possibleIndexSet : number[][]) : SpringLinkType[] {
        let links : SpringLinkType[] = [];

        possibleIndexSet.forEach(s => {
            let link_gridX = gridX + s[0];
            let link_gridY = gridY + s[1];

            if (link_gridX < maxSize && link_gridY < maxSize && link_gridX >= 0 && link_gridY >= 0) {
                let arrayIndex = GetLinearIndex(link_gridX, link_gridY, maxSize);

                let linkNode = set[arrayIndex];
                let restLength = vec2.dist(node.position, linkNode.position);

                let linkType  : SpringLinkType= { id : GetSpringLinkTableID(index, arrayIndex), restLength : restLength, nodes : [node, linkNode] };
                links.push(linkType);
            }
        });

        return links;
    }

    private SetSpringLinkToTable(linkTable : SpringLinkTable, linkTypes: SpringLinkType[]) {
        linkTypes.forEach(l => {
            if (!(l.id in linkTable)) {
                linkTable[l.id] = l;
            }
        });

        return linkTable;
    }
}