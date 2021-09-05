import SpringSegment from "./SpringSegment";
import SpringNode from "./SpringNode";

export default class SpringMassCanvas {

    protected _canvasDom : HTMLCanvasElement;
    get canvasDom() {
        return this._canvasDom;
    }
    
    protected _context : CanvasRenderingContext2D;

    private maxDrawBufferSize = 2048;

    public constructor(canvasQueryString : string) {
        this._canvasDom = document.querySelector(canvasQueryString);
        this._context = this._canvasDom.getContext("2d");

        this.AutoSetCanvasSize();
        window.addEventListener('resize', () => {
            this.AutoSetCanvasSize();
        });
    }

    public Draw(nodes : SpringNode[]) {
        this._context.clearRect(0, 0, this._canvasDom.width, this._canvasDom.height);

        let nLens = nodes.length;
        for (let i = 0; i < nLens; i++) {

            this.DrawCircle(nodes[i].position[0], nodes[i].position[1], 7);
            
        }
    }

    private DrawCircle(x : number, y: number, radius : number) {
        this._context.beginPath();

        this._context.fillStyle = "rgb(255,165,0)";
        this._context.arc(x, y, radius, 0, 2 * Math.PI);
        this._context.fill();

    }

    private AutoSetCanvasSize() {
        this.SetCanvasToSceenSize(this._canvasDom.clientWidth, this._canvasDom.clientHeight);
    }

    private SetCanvasToSceenSize(displayWidth : number, displayHeight : number) {
        //Set default to 2k resolution, if user has high spec digital screen
  
        if (displayWidth > this.maxDrawBufferSize || displayHeight > this.maxDrawBufferSize) {
          displayHeight = (displayHeight > displayWidth) ? this.maxDrawBufferSize : (this.maxDrawBufferSize * displayHeight / displayWidth);
          displayWidth = (displayWidth >= displayHeight) ? this.maxDrawBufferSize : (this.maxDrawBufferSize * displayWidth / displayHeight);
        }
  
        this._canvasDom.width = displayWidth;
        this._canvasDom.height = displayHeight;
    }
}