import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
varying vec3 v_position;
void main(){
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * .1,1.0);
}
`
const fShader = `
varying vec3 v_position;
void main(){
    vec3 color = vec3(0.0);
    color.r = clamp(v_position.x,0.0,1.0);
    color.g = clamp(v_position.y,0.0,1.0);
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = {} 
const demoMounted = (threeScene:ThreeScene)=>{
const geometry = new PlaneGeometry();
const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,uniforms});
const plane = new Mesh(geometry,material)
threeScene.scene.add(plane) 
const animate = () => {
requestAnimationFrame(animate);
threeScene.animate();
};
animate();
}