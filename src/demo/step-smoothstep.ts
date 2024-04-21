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
    // color.r = step(.2,v_position.x);
    // color.g = step(.2,v_position.y);
    color.r = smoothstep(0.0,.02,v_position.x);
    color.g = smoothstep(0.0,.02,v_position.y);
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = {}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry();
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    const animate = () => {
        requestAnimationFrame(animate);
        threeScene.animate();
    };
    animate();
}