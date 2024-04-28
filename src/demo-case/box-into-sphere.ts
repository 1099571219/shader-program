import { BoxGeometry, Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
uniform float u_time;
uniform float u_radius;

void main() {
  //vec3 pos = position; 

  float delta = ((sin(u_time)+1.0)/2.0);

  vec3 v = normalize(position) * u_radius;
  vec3 pos = mix(position, v, delta);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos * .5, 1.0 );
}
`
const fShader = `
void main()
{
  vec3 color = vec3(0.5);
  gl_FragColor = vec4(color, 1.0);
}
`
const uniforms = {
    u_time: { value: 0.0 },
    u_radius:{value:1.0}
}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new BoxGeometry(2,2,2,10,10,10);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms,wireframe:true });
    const box = new Mesh(geometry, material)
    threeScene.scene.add(box)
    const clock = new Clock()
    const controls = new OrbitControls(threeScene.camera,threeScene.renderer.domElement)
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
        controls.update();
    };
    animate();
}