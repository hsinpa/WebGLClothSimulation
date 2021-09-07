export function GetLinearIndex(gridX : number, gridY:number, size : number) {
    return gridX + (gridY * size);
}

export function GetSpringLinkTableID(index_a :number, index_b : number) {
    let frontID = (index_a < index_b) ? index_a : index_b;
    let backID = (frontID == index_a) ? index_b : index_a;

    return frontID + "-" + backID;
}

export function ShuffleArray<T>(array : T[]) : T[] {
    let cloneArray = [...array];

    for (let i = cloneArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloneArray[i], cloneArray[j]] = [cloneArray[j], cloneArray[i]];
    }

    return cloneArray;
}