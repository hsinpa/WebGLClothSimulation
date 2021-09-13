import Babylon from "babylonjs";
import BabylonSpringNode from "./BabylonSpringNode";

export interface TrigIndexLookTable {
    [id: number] : number //Size 3
}

export default class BabylonMesh {

    private _startX : number;
    private _startY : number;
    private _stepX : number;
    private _stepY : number;
    private _size : Babylon.Vector2;

    private _vertices  : number[] = [];
    private _normal : number[] = [];
    private _uv : number[] = [];
    private _triangles : number[] = [];
    private trigIndexTable : TrigIndexLookTable;

    public meshNode : BabylonSpringNode[] = [];

    constructor(startX : number, startY : number, stepX: number, stepY : number, size : Babylon.Vector2) {
        this._startX = startX;
        this._startY = startY;
        this._stepX = stepX;
        this._stepY = stepY;
        this._size = size;

        this.trigIndexTable = {};
    }

    public GetMesh(name : string) : Babylon.Mesh {
        let mesh = new Babylon.Mesh(name);

        let vertex = new Babylon.VertexData();
        vertex.positions = this._vertices;
        vertex.indices = this._triangles;
        vertex.uvs = this._uv;

        Babylon.VertexData.ComputeNormals(vertex.positions, vertex.indices, this._normal);
        vertex.normals = this._normal;

        vertex.applyToMesh(mesh);

        return mesh;
    }

    public GetVerticePos(xIndex : number, yIndex: number ) {
        let objectX = this._startX + (this._stepX * xIndex), 
            objectY = this._startY - (this._stepY * yIndex), // Top down approach
            uniqueID = xIndex + (yIndex * this._size.x);

        return new Babylon.Vector4(objectX, objectY, 0, uniqueID);
    }

    public PushVertices(verticeA: Babylon.Vector4, verticeB : Babylon.Vector4, verticeC : Babylon.Vector4) {
        let indexA = this.PushVertice(verticeA);

        let indexB = this.PushVertice(verticeB);

        let indexC = this.PushVertice(verticeC);
    }

    private PushVertice(vertice: Babylon.Vector4) {
        if (vertice.w in this.trigIndexTable) {
            let cacheIndex = this.trigIndexTable[vertice.w];

            this._triangles.push(cacheIndex);

            return cacheIndex;
        }

        //Save to lookup table
        let index = Math.floor(this._vertices.length / 3);

        this._vertices.push(vertice.x, vertice.y, vertice.z);

        //this._normal.push(0, 0, -1);

        this._triangles.push(index);
        this._uv.push( (-this._startX - vertice.x) / this._size.x, 1 - ((this._startY - vertice.y) / this._size.y));

        this.trigIndexTable[vertice.w] = index;

        return index;
    }
}