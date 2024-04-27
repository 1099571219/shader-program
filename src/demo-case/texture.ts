import { Clock, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
varying vec2 vUv;
void main() {	
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
const fShader = `
#define PI 3.141592653589
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform float u_time;

varying vec2 vUv;

//Based on http://clockworkchilli.com/blog/8_a_fire_shader_in_glsl_for_your_webgl_games

void main (void)
{
  vec4 col;
  vec3 color;
    vec2 uv = vec2(vUv + u_time/8.0);

  if (vUv.x<0.5){
    if (vUv.y<0.5){
    //   col = texture2D(u_tex, vUv*2.0);
      col = texture2D(u_tex, fract(uv*2.0));
      color = vec3(0.0,0.0,col.b);
    }else{
      col = texture2D(u_tex, fract(uv*2.0));
      color = vec3(col.r,0.0,0.0);
    }
  }else{
    if (vUv.y<0.5){
      col = texture2D(u_tex, fract(uv*2.0));
      color = vec3(col.a);
    }else{
      col = texture2D(u_tex, fract(uv*2.0));
      color = vec3(0.0,col.g,0.0);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`
const uniforms = {u_time:{value:0},u_tex: { value: new TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/flame.png") }} 
const demoMounted = (threeScene:ThreeScene)=>{
const geometry = new PlaneGeometry(2,2);
const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,uniforms});
const plane = new Mesh(geometry,material)
threeScene.scene.add(plane) 
const clock = new Clock()
const animate = () => {
requestAnimationFrame(animate);
uniforms.u_time.value = clock.getElapsedTime()
threeScene.animate();
};
animate();
}