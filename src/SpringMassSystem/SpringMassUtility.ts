export function GetLinearIndex(gridX : number, gridY:number, size : number) {
    return gridX + (gridY * size);
}

export function GetSpringLinkTableID(index_a :number, index_b : number) {
    let frontID = (index_a < index_b) ? index_a : index_b;
    let backID = (frontID == index_a) ? index_b : index_a;

    return frontID + "-" + backID;
}