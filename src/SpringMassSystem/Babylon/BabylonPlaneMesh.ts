import Babylon from "babylonjs";
import BabylonMeshHelper from "./BabylonMeshHelper";

export default class BabylonPlaneMesh {


    public Generate(size : Babylon.Vector2, subdivide : number) {
        let vertexData = this.GetVertexAndIndice(size, subdivide);

        return vertexData.GetMesh("plane_mesh");
    }

    private GetVertexAndIndice(size: Babylon.Vector2, subdivide: number) {
        let startX = -(size.x * 0.5);
        let startY = size.y;
        let stepX = size.x / (subdivide);
        let stepY = size.y / (subdivide);
        let constZ = 0;
        let constNormal = [0, 0, -1];

        let meshHelper = new BabylonMeshHelper(startX, startY, stepX, stepY, size);

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