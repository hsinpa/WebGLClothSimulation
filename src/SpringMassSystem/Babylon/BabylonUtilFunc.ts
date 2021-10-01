import Babylon from "babylonjs";

export function SetMaterial(shader_name : string, raw_vert : string, raw_frag : string) {
    Babylon.Effect.ShadersStore[shader_name + "Vert"] = raw_vert;
    Babylon.Effect.ShadersStore[shader_name + "Frag"] = raw_frag;

}

export function GetMaterial(shader_name : string, scene : Babylon.Scene) {
    return new Babylon.ShaderMaterial(
        shader_name,
        scene,
        {
          vertex: shader_name,
          fragment: shader_name,
        },
        {
          attributes: ["position", "normal", "uv", "a_offset"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        },
      );

}

export function IntersectionPlane(planePos : Babylon.Vector3, planeNormal : Babylon.Vector3, rayPos : Babylon.Vector3, rayNormal : Babylon.Vector3) {
  let denom = Babylon.Vector3.Dot(planeNormal, rayNormal);
  let result : IntersectionResult = {valid : false, t : 0};

  if (denom > 1e-6) { 
      let p0l0 = planePos.subtract(rayPos); 
      let t = Babylon.Vector3.Dot(p0l0, planeNormal) / denom; 

      result.t = t ;
      result.valid = t >= 0;

      return result; 
  }

  return result; 
}

export function DistanceFromPlaneOrigin(planeOrigin : Babylon.Vector3, planeNormal : Babylon.Vector3, landPos : Babylon.Vector3) {
  let distance = landPos.subtract(planeOrigin);

  let D = new Babylon.Vector3(Math.pow(planeNormal.x, 2), Math.pow(planeNormal.y, 2), Math.pow(planeNormal.z, 2) );
      D = D.multiplyInPlace(distance);

  let lDenomiator = 1 / planeNormal.length();
  let d = (D.x + D.y + D.z) * lDenomiator;

  let result = planeOrigin.multiply(planeNormal).scale(lDenomiator);

  return (result.x + result.y + result.z) - d;
}

export interface IntersectionResult {
  valid : boolean,
  t : number
}