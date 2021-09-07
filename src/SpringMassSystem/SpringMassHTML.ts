

export interface SliderEventType { (currentValue : number): void }

export default class SpringMassHTML {

    constructor(canvasQuery : string) {
        
    }

    GetSliderHTML(
        title : string, className : string, name : string, 
        defaultValue : number, min : number, max : number) {

        var htmlObject = document.createElement('div');
        htmlObject.className = className;
        htmlObject.setAttribute("name", name);

        htmlObject.innerHTML = `
        <label name="${name}">${title}</label><br>
        <input type="range" min="${min}" max="${max}" step="0.01" value="${defaultValue}" class="slider" name="${name}">
        <br>`;
    }

}