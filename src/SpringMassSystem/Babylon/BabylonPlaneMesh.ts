import Babylon from "babylonjs";

export default class BabylonPlaneMesh {


    public Generate(size : Babylon.Vector2, subdivide : number) {
        let mesh = new Babylon.Mesh("plane_mesh");

        this.GetVertexAndIndice(size, subdivide);

        return mesh;
    }

    private GetVertexAndIndice(size: Babylon.Vector2, subdivide: number) {
        let startX = -(size.x * 0.5);
        let startY = size.y;
        let stepX = size.x / (subdivide);
        let stepY = size.y / (subdivide);
        let constZ = 0;
        let constNormal = [0, 0, -1];

        let vertices = [];
        let indices = []; 

        for (let y = 0; y < subdivide; y++) {
            for (let x = 0; x < subdivide; x++) {
                let objectX = startX + (stepX * x), 
                    objectY = startY - (stepY * y); // Top down approach

                let aVertice = this.GetVerticePos(startX, startY, stepX, stepY, x, y);
                let bVertice = this.GetVerticePos(startX, startY, stepX, stepY, x+1, y);
                let cVertice = this.GetVerticePos(startX, startY, stepX, stepY, x+1, y+1);

                let dVertice = this.GetVerticePos(startX, startY, stepX, stepY, x+1, y+1);
                let eVertice = this.GetVerticePos(startX, startY, stepX, stepY, x, y+1);
                let fVertice = this.GetVerticePos(startX, startY, stepX, stepY, x, y);
                vertices.push(aVertice.x, aVertice.y, aVertice.z);
                vertices.push(bVertice.x, bVertice.y, bVertice.z);
                vertices.push(cVertice.x, cVertice.y, cVertice.z);

                vertices.push(dVertice.x, dVertice.y, dVertice.z);
                vertices.push(eVertice.x, eVertice.y, eVertice.z);
                vertices.push(fVertice.x, fVertice.y, fVertice.z);
            }
        }

        console.log(vertices);
    }

    private GetVerticePos(startX : number, startY : number, stepX: number, stepY : number, xIndex : number, yIndex: number) {
        let objectX = startX + (stepX * xIndex), 
        objectY = startY - (stepY * yIndex); // Top down approach

        return new Babylon.Vector3(objectX, objectY, 0);
    }

}