import Babylon from "babylonjs";
import PlaneMeshMaker from './BabylonPlaneMesh';
import {SetMaterial, GetMaterial} from './BabylonUtilFunc';
import WebglUtility from '../../Utility/WebglUtility';

export default class BabylonCanvas {
    private _view : HTMLCanvasElement;
    private _engine : Babylon.Engine;
    private _scene : Babylon.Scene;
    private _webglUtility : WebglUtility;

    constructor(canvasQuery : string) {
        this._view = document.querySelector(canvasQuery) as HTMLCanvasElement
        this._engine = new Babylon.Engine(this._view, true);
        this._scene = new Babylon.Scene(this._engine);
        this._webglUtility = new WebglUtility();

        this.CanvasInit();
    }

    private async CanvasInit() {
        let deformMeshData = await this._webglUtility.GetVertFragShader("./shader/DeformMesh.vert", "./shader/DeformMesh.frag");
        //SetMaterial("deformmesh", deformMeshData.vertex_shader, deformMeshData.fragment_shader);

        Babylon.Effect.ShadersStore["deformMeshVertexShader"] = deformMeshData.vertex_shader;
        Babylon.Effect.ShadersStore["deformMeshFragmentShader"] = deformMeshData.fragment_shader;
    

        let aspectRatio = this._view.clientWidth / this._view.clientHeight;

        this.ConfigSceneSetting(this._scene, aspectRatio);

    }

    private ConfigSceneSetting(scene : Babylon.Scene, aspectRatio : number)  {
        let customPlaneMesh = new PlaneMeshMaker()

        //Camera
        var camera = new Babylon.UniversalCamera("UniversalCamera", new Babylon.Vector3(0, 2, -10), scene);
        camera.mode = Babylon.Camera.PERSPECTIVE_CAMERA;
        let cameraSize = 3;
        camera.orthoBottom = -cameraSize;
        camera.orthoTop = cameraSize;
        camera.orthoRight = cameraSize * aspectRatio;
        camera.orthoLeft = -cameraSize * aspectRatio;

        camera.fov = 65;

        // Targets the camera to a particular position. In this case the scene origin
        camera.setTarget(Babylon.Vector3.Zero());

        const light = new Babylon.HemisphericLight(
             "light",
             new Babylon.Vector3(0.3, 0.8, -0.8),
             scene)

        // var sphere = Babylon.Mesh.CreateBox('sphere1', 2, scene);
        // sphere.position = new Babylon.Vector3(0, 0, 0);

        let planeMesh = customPlaneMesh.Generate(new Babylon.Vector2(15, 15), 1);
        planeMesh.position = new Babylon.Vector3(0, 0, 1);
        planeMesh.rotate(new Babylon.Vector3(0, 1, 0), Math.PI);
        planeMesh.material = GetMaterial("deformMesh", scene);

        scene.addMesh(planeMesh);

        this._engine.runRenderLoop(() => {
             scene.render();
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });    
    }
}