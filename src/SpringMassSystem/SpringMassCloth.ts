import SpringNode from "./SpringNode";
import {SpringNodeType, SpringLinkType, SpringMassConfig} from './SpringMassStatic';
import { vec2 } from "gl-matrix";
import {GetLinearIndex, GetSpringLinkTableID, ShuffleArray} from '../Utility/SpringMassUtility';

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
    get width() : number {return this._width;}

    private _height : number;
    get height() : number {return this._height;}

    private _subdivide : number;
    get subdivide() : number {return this._subdivide;}

    private _springNatureLength : number;
    private _springLinkLookupTable : SpringLinkTable;
    
    private _springMassConfig : SpringMassConfig;
    get springMassConfig() : Readonly<SpringMassConfig> {
        return this._springMassConfig;
    }

    public constructor(size : number, subdivide : number, startPointX : number, startPointY: number) {
        this._width = size;
        this._height = size;
        this._subdivide = subdivide;
        this._springNatureLength = size / subdivide;

        this._springMassConfig = this.GetDefaultSpringMassConfig();
        this._nodes = this.CreateClothNodes(startPointX, startPointY, subdivide, this._springNatureLength);
        this._springLinkLookupTable = this.GenerateSpringLink();
        
        console.log(this._springLinkLookupTable);
    }

    public Update() {
        let shuffle = ShuffleArray(this._nodes);
        //let shuffle = this._nodes;

        let l = shuffle.length;

        for (let i = 0; i < l; i++) {
            if (shuffle[i].isStatic) continue;

            shuffle[i].UpdateVelocity(this._springMassConfig, this._subdivide+1, this._springLinkLookupTable);
        }
    }

    public SetSpringMassConfig(config : SpringMassConfig) {
        if (config.k !== undefined)
            this._springMassConfig.k = config.k;

        if (config.mass !== undefined)
            this._springMassConfig.mass = config.mass;

        if (config.gravity !== undefined)
            this._springMassConfig.gravity = config.gravity;

        if (config.damping !== undefined)
            this._springMassConfig.damping = config.damping;
    }

    private GetDefaultSpringMassConfig() : SpringMassConfig {
        return {
            k : 7,
            mass : 5,
            gravity : 10,
            timeStep : 0.02,
            damping : 30
        }
    }

    private CreateClothNodes( startPointX : number, startPointY: number, subdivide : number, springNatureLength : number) : SpringNode[] {
        let nodes : SpringNode[] = [];

        for (let y = 0; y <= subdivide; y++) {
            for (let x = 0; x <= subdivide; x++) {
                let type : SpringNodeType = ((y == 0 && x == 0) || (y == 0 && x == subdivide)) ? SpringNodeType.ControlPoint : SpringNodeType.FreePoint;
                
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

            //Shear Links
            this.SetSpringLinkToTable(table, this.FindSpring(this._nodes[i], i, gridX, gridY, size, this._nodes,  [[-1, 1], [1, 1]]));

            //Flexion Links
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