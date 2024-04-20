import { Clock, Mesh, Plane, PlaneGeometry, ShaderMaterial } from "three";
import type { ThreeScene } from "../js/threeScene";
import eventBus from "../store";

eventBus.on("threeScene", (data) => {
  demoMounted(data);
});

const demoMounted = (threeScene: ThreeScene) => {
  getResolution();
  const clock = new Clock();

  threeScene.scene.add(plane);
  const animate = () => {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    threeScene.animate();
  };
  animate();
};

const vShader = `
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;
const fShader = `
uniform float u_time;
void main(){
    vec3 color = vec3((sin(u_time)+1.0)/2.0,0.3,(cos(u_time)+1.0)/2.0);
    gl_FragColor = vec4(color,1.0);
}
`;
const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: { x: 0, y: 0 } },
};

const geometry = new PlaneGeometry();
const material = new ShaderMaterial({
  vertexShader: vShader,
  fragmentShader: fShader,
  uniforms,
});
const plane = new Mesh(geometry, material);

const getResolution = () => {
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerWidth;
};
