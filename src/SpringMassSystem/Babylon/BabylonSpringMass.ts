import BabylonMesh from './BabylonMesh';
import BabylonSpringNode from './BabylonSpringNode';
import {BabylonSpringLinkType} from '../SpringMassStatic';

export interface SpringLinkTable {
    [id: string] : BabylonSpringLinkType
}

export default class BabylonSpringMass {

    private _meshData : BabylonMesh;

    constructor(meshData : BabylonMesh) {
        this._meshData = meshData;
    }
    
    

}