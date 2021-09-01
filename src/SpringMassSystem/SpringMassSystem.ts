import SpringMassCanvas from "./SpringMassCanvas";
import SpringSegment from "./SpringSegment";

export default class SpringMassSystem {
    private _canvas : SpringMassCanvas;
    private previousTimeStamp : number = 0;
    private time : number;

    public segments : SpringSegment[];

    public constructor(canvasQueryString : string) {
        this._canvas = new SpringMassCanvas(canvasQueryString);
        this.segments = [];

        window.requestAnimationFrame(this.FrameLoop.bind(this));
    }

    public CreateSpringSegment(x : number, y : number, segmentCount : number, segmentDistance: number) {
        let segment = new SpringSegment(x, y, segmentCount, segmentDistance);
        this.segments.push(segment);
    }

    private FrameLoop(timeStamp : number) {
        let ms =  (timeStamp - this.previousTimeStamp) / 1000;
        this.time = (timeStamp) / 1000;
        this.previousTimeStamp = timeStamp;

        this._canvas.Draw(this.segments);

        window.requestAnimationFrame(this.FrameLoop.bind(this));
    }

    

}