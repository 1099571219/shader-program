import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
varying vec2 v_uv;
void main(){
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`
const fShader = `
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

varying vec2 v_uv;

float random (vec2 st,float seed) {
  const float a = 12.12911;
  const float b = 70.3281;
  const float c = 1000.0;
  return fract(sin(dot(st, vec2(a, b))+seed) * c );
}

void main(){    
    vec3 color = random(v_uv,u_time)*vec3(1.0);
	gl_FragColor  = vec4(color, 1.0);
}
`

const uniforms = {u_time:{value:0},u_resolution:{value:{x:0,y:0}}} 
const demoMounted = (threeScene:ThreeScene)=>{
const geometry = new PlaneGeometry();
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