import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import eventBus from '../store/index';

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`
const fShader = `
void main(){
    vec3 color = vec3(1.0);
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = {u_time:{value:0}} 
const demoMounted = (threeScene:ThreeScene)=>{
const geometry = new PlaneGeometry();
const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,uniforms});
const plane = new Mesh(geometry,material)
const controls = new OrbitControls(threeScene.camera,threeScene.renderer.domElement)
threeScene.scene.add(plane) 
const clock = new Clock()
const animate = () => {
requestAnimationFrame(animate);
uniforms.u_time.value = clock.getElapsedTime()
controls.update()
threeScene.animate();
};
animate();
}