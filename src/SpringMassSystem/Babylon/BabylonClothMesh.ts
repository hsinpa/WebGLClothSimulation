import Babylon from "babylonjs";
import BabylonMesh from "./BabylonMesh";
import BabylonSpringMass from './BabylonSpringMass';

export default class BabylonClothMesh {

    public meshData : BabylonMesh;
    public mesh : Babylon.Mesh;
    public springMass : BabylonSpringMass;

    constructor(size : Babylon.Vector2, subdivide : number) {
        this.meshData = this.GetVertexAndIndice(size, subdivide );
        this.mesh = this.meshData.GetMesh("cloth_mesh [Generate]");

        this.springMass = new BabylonSpringMass(this.meshData);
    }

    private GetVertexAndIndice(size: Babylon.Vector2, subdivide: number) {
        let startX = -(size.x * 0.5);
        let startY = size.y;
        let stepX = size.x / (subdivide);
        let stepY = size.y / (subdivide);
        let constZ = 0;
        let constNormal = [0, 0, -1];

        let meshHelper = new BabylonMesh(startX, startY, stepX, stepY, size);

        for (let y = 0; y < subdivide; y++) {
            for (let x = 0; x < subdivide; x++) {
                let objectX = startX + (stepX * x), 
                    objectY = startY - (stepY * y); // Top down approach

                let aVertice = meshHelper.GetVerticePos(x, y);
                let bVertice = meshHelper.GetVerticePos(x+1, y);
                let cVertice = meshHelper.GetVerticePos(x+1, y+1);

                let dVertice = meshHelper.GetVerticePos(x+1, y+1);
                let eVertice = meshHelper.GetVerticePos(x, y+1);
                let fVertice = meshHelper.GetVerticePos(x, y);

                meshHelper.PushVertices(aVertice, bVertice, cVertice);
                meshHelper.PushVertices(dVertice, eVertice, fVertice);
            }
        }

        return meshHelper;
    }


}