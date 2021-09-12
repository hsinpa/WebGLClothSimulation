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
          attributes: ["position", "normal", "uv"],
          uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        },
      );

}