import SpringNode from "./SpringNode";
import {SpringNodeType} from './SpringMassStatic';

export default class SpringSegment {

    private _nodes : SpringNode[];
    private _segmentNumber : number;
    private _segmentDistance : number;

    get nodeLength() : number {
        return this._nodes.length;
    }

    get nodes() : SpringNode[] {
        return this._nodes;
    }

    public constructor(parentX : number, parentY : number, segmentCount : number, segmentDistance : number) {
        this._segmentNumber = segmentCount;
        this._segmentDistance = segmentDistance;
        this._nodes = [];
        this._nodes.push(new SpringNode(parentX, parentY, SpringNodeType.ControlPoint) );
        
        for (let i = 0; i < segmentCount -1; i ++) {
            this.PushNode();
        }
    }

    public PushNode() : SpringNode {
        if (this.nodeLength <= 0) return;
        
        let lastNode = this._nodes[this.nodeLength - 1];
        let lNodeX = lastNode.position[0], lNodeY = lastNode.position[1];

        let newNode = new SpringNode(lNodeX - this._segmentDistance, lNodeY + this._segmentDistance, SpringNodeType.FreePoint);

        this._nodes.push(newNode);
        this._segmentNumber++;
        return newNode;
    }

    public PopNode() : SpringNode{
        if (this.nodeLength <= 0) return;
        
        this._segmentNumber--;
        return this._nodes.pop();
    }

    public Update() {
        let l = this._nodes.length;

        for (let i = 0; i < l; i++) {
            if (this._nodes[i].isStatic) continue;

            let anchorNode = (i > 0) ? this._nodes[i - 1] : null;
            
            this._nodes[i].UpdateForce(anchorNode);
        }
    }
}