import { BoxGeometry, Clock, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import eventBus from '../store';

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
const uniforms = { u_time: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const flyControls = new FlyControls(threeScene.camera, threeScene.renderer.domElement)
    flyControls.movementSpeed = 1;
    flyControls.domElement = threeScene.renderer.domElement;
    flyControls.rollSpeed = Math.PI / 24;
    flyControls.autoForward = false;
    flyControls.dragToLook = true;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    threeScene.scene.add(cube)
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        
        flyControls.update(.5)
        threeScene.animate();
    };
    animate();
}