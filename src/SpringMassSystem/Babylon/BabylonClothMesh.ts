import Babylon from "babylonjs";
import BabylonMesh, {TrigIndexLookTable} from "./BabylonMesh";
import BabylonSpringMass from './BabylonSpringMass';
import BabylonSpringNode from './BabylonSpringNode';
import {SpringNodeType, SpringMassConfig} from '../SpringMassStatic'
import {GetRandomRange} from '../../Utility/UtilityFunc'
import {IntersectionPlane, IntersectionResult, DistanceFromPlaneOrigin} from './BabylonUtilFunc';

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

        this.springMass
        this.springMass.GenerateSpringLink(subdivide);
        this.config = this.GetDefaultSpringMassConfig();
    }

    public Update() {
        // let l = this.springMass._springNodeArray.length;
        // let randomOffset = [];
        // for (let i = 0 ; i < l ; i++) {
        //     randomOffset.push(GetRandomRange(-1, 1), GetRandomRange(-1, 1), GetRandomRange(-1, 1));
        // }

        // return randomOffset;
        return this.springMass.UpdatePhysics(this.config, this.meshData.trigIndexTable);
    }

    public GetCollideCtrlNode(rayOriPos : Babylon.Vector3, rayOriDir : Babylon.Vector3, camera : Babylon.Camera) {
        let size = 0.3;
        let ctrlNodeLength = this.springMass.controlNodeArray.length;

        for (let i = 0; i < ctrlNodeLength; i++) {
            let node = this.springMass.controlNodeArray[i];
            let nodeWorldPos = node.position.add(this.springMass.controlNodeArray[i].offset).add(this.mesh.position);
            
            let lookatDir = nodeWorldPos.subtract(camera.position).normalize();
            let result = IntersectionPlane(nodeWorldPos, lookatDir, rayOriPos, rayOriDir);
            let landPoint = rayOriPos.add(rayOriDir.scale(result.t));

            let dist = nodeWorldPos.subtractInPlace(landPoint).length();
            if (dist < size) {
                console.log("dist " + dist +", "+ this.springMass.controlNodeArray[i].position);
                return this.springMass.controlNodeArray[i];
            }
        }

        return null;
    }

    private GetVertexAndIndice(size: Babylon.Vector2, subdivide: number) {
        let startX = -(size.x * 0.5);
        let startY = size.y;
        let stepX = size.x / (subdivide);
        let stepY = size.y / (subdivide);

        let meshHelper = new BabylonMesh(startX, startY, stepX, stepY, subdivide, size);

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
            mass : 10,
            gravity : 10,
            timeStep : 0.02,
            damping : 30
        }
    }
}