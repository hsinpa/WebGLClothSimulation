import Babylon from "babylonjs";
import PlaneMeshMaker from './BabylonPlaneMesh';

export default class BabylonCanvas {
    private _view : HTMLCanvasElement;
    private _engine : Babylon.Engine;
    private _scene : Babylon.Scene;

    constructor(canvasQuery : string) {
        this._view = document.querySelector(canvasQuery) as HTMLCanvasElement
        this._engine = new Babylon.Engine(this._view, true);
        this._scene = new Babylon.Scene(this._engine);

        let aspectRatio = this._view.clientWidth / this._view.clientHeight;

        this.ConfigSceneSetting(this._scene, aspectRatio);
    }

    ConfigSceneSetting(scene : Babylon.Scene, aspectRatio : number)  {
        let customPlaneMesh = new PlaneMeshMaker()

        //Camera
        var camera = new Babylon.UniversalCamera("UniversalCamera", new Babylon.Vector3(2, 3, -10), scene);
        camera.mode = Babylon.Camera.PERSPECTIVE_CAMERA;
        let cameraSize = 3;
        camera.orthoBottom = -cameraSize;
        camera.orthoTop = cameraSize;
        camera.orthoRight = cameraSize * aspectRatio;
        camera.orthoLeft = -cameraSize * aspectRatio;

        camera.fov = 45;

        // Targets the camera to a particular position. In this case the scene origin
        camera.setTarget(Babylon.Vector3.Zero());

        const light = new Babylon.HemisphericLight(
             "light",
             new Babylon.Vector3(0, 1, 0),
             scene)

        var sphere = Babylon.Mesh.CreateBox('sphere1', 2, scene);
        sphere.position = new Babylon.Vector3(0, 0, 0);

        customPlaneMesh.Generate(new Babylon.Vector2(50, 50), 3);

        this._engine.runRenderLoop(() => {
             scene.render();
        });
    }
}