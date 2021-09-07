export function SetDomInputValue(inputName : string, callback : (x : number) => void ) {
    let inputDom : any = document.querySelector(`input[name='${inputName}']`);
    let sliderLabel: any = document.querySelector(`label[name='${inputName}']`);

    let template = sliderLabel.innerHTML;
    inputDom.addEventListener("input", (e : any) => {
        sliderLabel.innerHTML = template.replace("{0}", e.target.value);

        callback(parseFloat(e.target.value));
    });

    sliderLabel.innerHTML = template.replace("{0}", inputDom.value);
    callback(parseFloat(inputDom.value));
}

export function Lerp( v0 : number,  v1 : number,  t : number) {
    return (1 - t) * v0 + t * v1;
  }