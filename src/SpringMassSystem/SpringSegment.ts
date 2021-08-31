import SpringNode from "./SpringNode";

export default class SpringSegment {

    private _nodes : SpringNode[];
    private _segmentNumber : number;
    private _segmentDistance : number;

    get nodeLength() : number {
        return this._nodes.length;
    }

    public constructor(parentX : number, parentY : number, segmentNumber : number, segmentDistance : number) {
        this._segmentNumber = segmentNumber;
        this._segmentDistance = segmentDistance;
        this._nodes = [];
        this._nodes.push(new SpringNode(parentX, parentY) );
    }

    public PushNode() : SpringNode {
        if (this.nodeLength <= 0) return;
        
        let lastNode = this._nodes[this.nodeLength - 1];
        let lNodeX = lastNode.position[0], lNodeY = lastNode.position[1];

        let newNode = new SpringNode(lNodeX, lNodeY + this._segmentDistance);
        this._nodes.push(newNode);
        this._segmentNumber++;
        return newNode;
    }

    public PopNode() : SpringNode{
        if (this.nodeLength <= 0) return;
        
        this._segmentNumber--;
        return this._nodes.pop();
    }
}