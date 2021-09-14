import Babylon from "babylonjs";
import BabylonMesh from "./BabylonMesh";
import BabylonSpringMass from './BabylonSpringMass';
import BabylonSpringNode from './BabylonSpringNode';
import {SpringNodeType, SpringMassConfig} from '../SpringMassStatic'
import {GetRandomRange} from '../../Utility/UtilityFunc'

export default class BabylonClothMesh {

    public meshData : BabylonMesh;
    public mesh : Babylon.Mesh;
    private springMass : BabylonSpringMass;

    public config : SpringMassConfig;

    constructor(engine : Babylon.Engine, size : Babylon.Vector2, subdivide : number) {
        this.springMass = new BabylonSpringMass(subdivide);
        this.meshData = this.GetVertexAndIndice(size, subdivide );
        let vertex = this.meshData.GetVertex();
        this.mesh = this.meshData.GetMesh("cloth_mesh [Generate]", vertex);
        
        this.springMass.GenerateSpringLink(subdivide);
        this.config = this.GetDefaultSpringMassConfig();
    }

    public Update() {
        let l = this.springMass._springNodeArray.length;
        let randomOffset = [];
        for (let i = 0 ; i < l ; i++) {
            randomOffset.push(GetRandomRange(-1, 1), GetRandomRange(-1, 1), GetRandomRange(-1, 1));
        }

        return randomOffset;
        //return this.springMass.UpdatePhysics(this.config);
    }

    private GetVertexAndIndice(size: Babylon.Vector2, subdivide: number) {
        let startX = -(size.x * 0.5);
        let startY = size.y;
        let stepX = size.x / (subdivide);
        let stepY = size.y / (subdivide);

        let meshHelper = new BabylonMesh(startX, startY, stepX, stepY, size);

        for (let y = 0; y <= subdivide; y++) {
            for (let x = 0; x <= subdivide; x++) {
                let objectX = startX + (stepX * x), 
                    objectY = startY - (stepY * y), // Top down approach
                    index = x + (y * (subdivide+1));

                let nodeType = ((y == 0 && x == 0) || (y ==0 && x == subdivide)) ? SpringNodeType.ControlPoint : SpringNodeType.FreePoint;
                
                //Record node original position
                this.springMass.PushNode(new BabylonSpringNode(new Babylon.Vector3(objectX, objectY, 0), index, x, y, nodeType));

                //Mesh
                if (y == subdivide || x == subdivide) continue;

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

    private GetDefaultSpringMassConfig() : SpringMassConfig {
        return {
            k : 7,
            mass : 5,
            gravity : 10,
            timeStep : 0.02,
            damping : 30
        }
    }


}