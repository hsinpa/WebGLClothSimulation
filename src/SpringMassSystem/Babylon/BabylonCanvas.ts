import Babylon from "babylonjs";
import BabylonClothMesh from './BabylonClothMesh';
import {SetMaterial, GetMaterial, IntersectionPlane, IntersectionResult, DistanceFromPlaneOrigin} from './BabylonUtilFunc';
import WebglUtility from '../../Utility/WebglUtility';
import InputHandler, {ClickState} from "../../Utility/Input/InputHandler";
import BabylonSpringNode from "./BabylonSpringNode";

export default class BabylonCanvas {
    private _view : HTMLCanvasElement;
    private _engine : Babylon.Engine;
    private _scene : Babylon.Scene;
    private _webglUtility : WebglUtility;
    private _inputHandler : InputHandler;

    private _cacheRay : Babylon.Ray;
    private _cacheCamera : Babylon.UniversalCamera;
    private _cachePlane : BabylonClothMesh;

    private _selectedNode : BabylonSpringNode;
    private _previousScrX : number;
    private _previousScrY : number;
    private _deltaScrX : number;
    private _deltaScrY : number;


    constructor(canvasQuery : string) {
        this._view = document.querySelector(canvasQuery) as HTMLCanvasElement
        this._engine = new Babylon.Engine(this._view, true);

        this._scene = new Babylon.Scene(this._engine);
        this._webglUtility = new WebglUtility();
        this._inputHandler = new InputHandler();
        this._cacheRay = Babylon.Ray.Zero();

        this._inputHandler.RegisterButtonEvent(this._view, this.OnMouseClickEvent.bind(this));

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
        this._cacheCamera = new Babylon.UniversalCamera("UniversalCamera", new Babylon.Vector3(0, 20, -20), scene);
        this._cacheCamera.mode = Babylon.Camera.PERSPECTIVE_CAMERA;
        let cameraSize = 3;

        // Targets the camera to a particular position. In this case the scene origin
        this._cacheCamera.setTarget(Babylon.Vector3.Zero());


        
        // Attach the camera to the canvas
        //camera.attachControl(this._view, true);

        const light = new Babylon.HemisphericLight(
             "light",
             new Babylon.Vector3(0.3, 0.8, -0.8),
             scene)

        // var sphere = Babylon.Mesh.CreateBox('sphere1', 2, scene);
        // sphere.position = new Babylon.Vector3(0, 0, 0);

        let clothMaterial = GetMaterial("deformMesh", scene);
        clothMaterial.wireframe = true;
        this._cachePlane = new BabylonClothMesh(this._engine, new Babylon.Vector2(10, 10), 5);
        this._cachePlane.mesh.position = new Babylon.Vector3(0, 0, 1);
        this._cachePlane.mesh.rotate(new Babylon.Vector3(0, 1, 0), Math.PI);
        this._cachePlane.mesh.material = clothMaterial;

        scene.addMesh(this._cachePlane.mesh);
        
        this._engine.runRenderLoop(() => {
             scene.render();
             let offset = this._cachePlane.Update();
             this._cachePlane.mesh.setVerticesData("a_offset", offset, true, 3);     
             this._inputHandler.OnUpdate();

             this._deltaScrX = this._previousScrX - this._scene.pointerX;
             this._deltaScrY = this._scene.pointerY - this._previousScrY;
             this._previousScrX = this._scene.pointerX;
             this._previousScrY = this._scene.pointerY;
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });    
    }

    OnMouseClickEvent(state : ClickState) {
        if (state == ClickState.Up) {

            this._selectedNode = null;
            return;
        }

        if (this._selectedNode != null && state == ClickState.Down) {
            this._selectedNode.UpdateLocalOffset(new Babylon.Vector3(this._deltaScrX, this._deltaScrY));

            return;
        }

        if (state == ClickState.Down) {
            //this._scene.createPickingRayInCameraSpaceToRef(this._scene.pointerX, this._scene.pointerY, this._cacheRay, this._cacheCamera);

            this._scene.createPickingRayToRef(this._scene.pointerX, this._scene.pointerY, Babylon.Matrix.Identity(), this._cacheRay,null);

            let collideNode = this._cachePlane.GetCollideCtrlNode(this._cacheRay.origin, this._cacheRay.direction, this._cacheCamera);

            if (collideNode != null) {
                this._selectedNode = collideNode;
            }
        }
    }   


}