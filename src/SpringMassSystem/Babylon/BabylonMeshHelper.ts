import Babylon from "babylonjs";

export interface TrigIndexLookTable {
    [id: number] : number //Size 3
}

export default class BabylonMeshHelper {

    private _startX : number;
    private _startY : number;
    private _stepX : number;
    private _stepY : number;
    private _size : Babylon.Vector2;

    private _vertices  : number[] = [];
    private _triangles : number[] = [];
    private trigIndexTable : TrigIndexLookTable;


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


        console.log(vertex.positions);
        console.log(vertex.indices);


        vertex.applyToMesh(mesh);

        return mesh;
    }

    public GetVerticePos(xIndex : number, yIndex: number ) {
        let objectX = this._startX + (this._stepX * xIndex), 
            objectY = this._startY - (this._stepY * yIndex), // Top down approach
            uniqueID = xIndex + (yIndex * this._size.x);

        console.log(objectX, objectY);

        return new Babylon.Vector4(objectX, objectY, 0, uniqueID);
    }

    public PushVertices(verticeA: Babylon.Vector4, verticeB : Babylon.Vector4, verticeC : Babylon.Vector4) {
        let indexA = this.PushVertice(verticeA);
        let indexB = this.PushVertice(verticeB);
        let indexC = this.PushVertice(verticeC);

        this._triangles.push(indexA, indexB, indexC);
    }

    private PushVertice(vertice: Babylon.Vector4) {
        if (vertice.w in this.trigIndexTable) {
            return this.trigIndexTable[vertice.w];
        }

        //Save to lookup table
        let index = this._triangles.length;

        this._vertices.push(vertice.x, vertice.y, vertice.z);

        this.trigIndexTable[vertice.w] = index;

        return index;
    }
}