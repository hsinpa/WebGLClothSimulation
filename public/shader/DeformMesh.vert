precision mediump float;
  
attribute vec3 position;
attribute vec2 uv;
attribute vec3 a_offset;

uniform mat4 worldViewProjection;
uniform mat4 world;
uniform mat4 projection;
uniform mat4 view;

varying vec2 v_uv;

void main () {
  v_uv = uv;

  vec3 newLocalPos = position + (a_offset*0.05);

  gl_Position = worldViewProjection * vec4(newLocalPos, 1.0);
}