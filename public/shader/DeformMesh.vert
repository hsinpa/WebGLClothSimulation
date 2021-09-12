precision mediump float;
  
attribute vec3 position;
attribute vec2 uv;

uniform mat4 worldViewProjection;

varying vec2 v_uv;

void main () {
  v_uv = uv;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}