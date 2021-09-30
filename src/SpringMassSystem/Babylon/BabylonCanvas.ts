import Babylon from "babylonjs";
import BabylonClothMesh from './BabylonClothMesh';
import {SetMaterial, GetMaterial} from './BabylonUtilFunc';
import WebglUtility from '../../Utility/WebglUtility';
import InputHandler, {ClickState} from "../../Utility/Input/InputHandler";

export default class BabylonCanvas {
    private _view : HTMLCanvasElement;
    private _engine : Babylon.Engine;
    private _scene : Babylon.Scene;
    private _webglUtility : WebglUtility;
    private _inputHandler : InputHandler;


    constructor(canvasQuery : string) {
        this._view = document.querySelector(canvasQuery) as HTMLCanvasElement
        this._engine = new Babylon.Engine(this._view, true);
        this._scene = new Babylon.Scene(this._engine);
        this._webglUtility = new WebglUtility();
        this._inputHandler = new InputHandler();

        this._inputHandler.RegisterButtonEvent(this.OnMouseClickEvent.bind(this));

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

        //Camera
        var camera = new Babylon.UniversalCamera("UniversalCamera", new Babylon.Vector3(0, 10, -20), scene);
        camera.mode = Babylon.Camera.PERSPECTIVE_CAMERA;
        let cameraSize = 3;

        // Targets the camera to a particular position. In this case the scene origin
        camera.setTarget(Babylon.Vector3.Zero());


        
        // Attach the camera to the canvas
        camera.attachControl(this._view, true);

        const light = new Babylon.HemisphericLight(
             "light",
             new Babylon.Vector3(0.3, 0.8, -0.8),
             scene)

        // var sphere = Babylon.Mesh.CreateBox('sphere1', 2, scene);
        // sphere.position = new Babylon.Vector3(0, 0, 0);

        let clothMaterial = GetMaterial("deformMesh", scene);
        clothMaterial.wireframe = true;
        let customPlaneMesh = new BabylonClothMesh(this._engine, new Babylon.Vector2(10, 10), 5);
        customPlaneMesh.mesh.position = new Babylon.Vector3(0, 0, 1);
        customPlaneMesh.mesh.rotate(new Babylon.Vector3(0, 1, 0), Math.PI);
        customPlaneMesh.mesh.material = clothMaterial;

        scene.addMesh(customPlaneMesh.mesh);


        const plane = Babylon.Mesh.CreatePlane("plane", 4, scene);
        plane.position = new Babylon.Vector3(0, -1, 0);
        console.log(plane.forward);

        
        this._engine.runRenderLoop(() => {
             scene.render();
             let offset = customPlaneMesh.Update();
             customPlaneMesh.mesh.setVerticesData("a_offset", offset, true, 3);     
             this._inputHandler.OnUpdate();
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });    
    }

    OnMouseClickEvent(state : ClickState) {
        if (state == ClickState.Click) {
            console.log("ClickState.Click");

            var pickResult = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
            console.log(`Origin ${pickResult.ray.origin}, Direction ${pickResult.ray.direction}, HasHit ${pickResult.hit}`);
        }
    }


}