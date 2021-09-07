import SpringMassCanvas from "./SpringMassCanvas";
import SpringSegment from "./SpringSegment";
import SpringNode from "./SpringNode";
import {SpringNodeType} from './SpringMassStatic'
import InputHandler, {ClickState} from "../Utility/Input/InputHandler";
import { vec2 } from "gl-matrix";
import SprinMassCloth from './SpringMassCloth'

export default class SpringMassSystem {
    private _canvas : SpringMassCanvas;
    private previousTimeStamp : number = 0;
    private time : number;
    private inputHandler : InputHandler

    public segments : SpringSegment[];
    private lastMousePosition : number[];
    private selectedControlPoint : SpringNode;

    private _springCloth : SprinMassCloth;
    get springCloth() {
        return this._springCloth;
    }
    
    public constructor(canvasQueryString : string) {
        this._canvas = new SpringMassCanvas(canvasQueryString);
        this.inputHandler = new InputHandler();
        this.segments = [];
        this.lastMousePosition = [0,0];

        this.inputHandler.RegisterMouseMovement( this._canvas.canvasDom,this.OnMouseUIEvent.bind(this));
        this.inputHandler.RegisterButtonEvent(this.OnMouseClickEvent.bind(this));

        window.requestAnimationFrame(this.FrameLoop.bind(this));
    }

    public CreateSpringSegment(x : number, y : number, segmentCount : number, segmentDistance: number) {
        let segment = new SpringSegment(x, y, segmentCount, segmentDistance);
        this.segments.push(segment);
    }

    public CreateClothMesh(size : number, subdivide : number, startPointX : number, startPointY: number) {
        this._springCloth = new SprinMassCloth(size, subdivide, startPointX, startPointY);
        this._springCloth.Update();

        console.log(this._springCloth.nodeLength);
    }

    private FrameLoop(timeStamp : number) {
        let ms =  (timeStamp - this.previousTimeStamp) / 1000;
        this.time = (timeStamp) / 1000;
        this.previousTimeStamp = timeStamp;

        this._canvas.Draw(this._springCloth.nodes);

        this._springCloth.Update();

        this.inputHandler.OnUpdate();

        if (this.selectedControlPoint != null)
             this.selectedControlPoint.UpdatePosition(this.lastMousePosition[0], this.lastMousePosition[1]);

        window.requestAnimationFrame(this.FrameLoop.bind(this));
    }

    private OnMouseUIEvent(mouse_position : number[], mouse_delta: number[]) {
        this.lastMousePosition = mouse_position;
    }

    OnMouseClickEvent(state : ClickState) {
        if (state == ClickState.Down) {
            let controlPoint = this.FindControlPoint(this.lastMousePosition[0], this.lastMousePosition[1]);

            if (controlPoint != null)
                this.selectedControlPoint = controlPoint;
        }

        if (state == ClickState.Up) {
            this.selectedControlPoint = null;
        }
    }

    private FindControlPoint(x : number, y : number) : SpringNode {

        let ctrlNode : SpringNode = null;

        this._springCloth.nodes.forEach(n => {
            if (n.type == SpringNodeType.ControlPoint) {
                let dist = vec2.distance(n.position, vec2.fromValues(x, y));

                if (dist < 10) {
                    ctrlNode = n;
                    return;
                }
            }
        });

        return ctrlNode;
    }  

}