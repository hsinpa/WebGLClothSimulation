import Babylon from "babylonjs";
import BabylonClothMesh from './BabylonClothMesh';
import {SetMaterial, GetMaterial, IntersectionPlane, IntersectionResult, DistanceFromPlaneOrigin} from './BabylonUtilFunc';
import WebglUtility from '../../Utility/WebglUtility';
import InputHandler, {ClickState} from "../../Utility/Input/InputHandler";

export default class BabylonCanvas {
    private _view : HTMLCanvasElement;
    private _engine : Babylon.Engine;
    private _scene : Babylon.Scene;
    private _webglUtility : WebglUtility;
    private _inputHandler : InputHandler;

    private _cacheRay : Babylon.Ray;
    private _cacheCamera : Babylon.UniversalCamera;
    private _cachePlane : Babylon.Mesh;

    constructor(canvasQuery : string) {
        this._view = document.querySelector(canvasQuery) as HTMLCanvasElement
        this._engine = new Babylon.Engine(this._view, true);
        this._scene = new Babylon.Scene(this._engine);
        this._webglUtility = new WebglUtility();
        this._inputHandler = new InputHandler();
        this._cacheRay = Babylon.Ray.Zero();

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
        let customPlaneMesh = new BabylonClothMesh(this._engine, new Babylon.Vector2(10, 10), 5);
        customPlaneMesh.mesh.position = new Babylon.Vector3(0, 0, 1);
        customPlaneMesh.mesh.rotate(new Babylon.Vector3(0, 1, 0), Math.PI);
        customPlaneMesh.mesh.material = clothMaterial;

        scene.addMesh(customPlaneMesh.mesh);


        this._cachePlane = Babylon.Mesh.CreatePlane("plane", 4, scene);
        this._cachePlane.position = new Babylon.Vector3(0, -1, 0);
        //this._cachePlane.rotate(new Babylon.Vector3(0, 1, 0), Math.PI);

        console.log(this._cachePlane.forward);
        
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

            //this._scene.createPickingRayInCameraSpaceToRef(this._scene.pointerX, this._scene.pointerY, this._cacheRay, this._cacheCamera);

            this._scene.createPickingRayToRef(this._scene.pointerX, this._scene.pointerY, Babylon.Matrix.Identity(), this._cacheRay,null);

            console.log(`CacheRay Origin ${this._cacheRay.origin}, CacheRay Direction ${this._cacheRay.direction}}`);

            // var picksResult = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
            // console.log(`Pick Origin ${picksResult.ray.origin}, Pick Direction ${picksResult.ray.direction},  Pick ${picksResult.hit}`);
            let f = this._cachePlane.forward;
            //f.z = -f.z;
            let result = IntersectionPlane(this._cachePlane.position, f, this._cacheRay.origin, this._cacheRay.direction);
            //console.log(`Origin ${this._cacheCamera.position}, Direction ${this._cacheRay.direction}, Valid ${result.valid}, T ${result.t}, F ${f}`);
        
            let landPoint = this._cacheRay.origin.add(this._cacheRay.direction.scale(result.t));
            let distance = DistanceFromPlaneOrigin(this._cachePlane.position, this._cachePlane.forward, landPoint);

            console.log(distance);
        }
    }


}