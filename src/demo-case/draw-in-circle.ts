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
    // float inCircle = 1.0 - step(.2,length(v_position.xy));
    float inCircle = 1.0 - smoothstep(.2,.21,length(v_position.xy));
    vec3 color = vec3(1.0,1.0,0.0) * inCircle;
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