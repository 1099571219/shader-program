import { Mesh, Plane, PlaneGeometry, ShaderMaterial } from "three";
import type { ThreeScene } from "../js/threeScene";
import eventBus from "../store";

eventBus.on("threeScene", (data) => {
  demoMounted(data);
});

const demoMounted = (threeScene: ThreeScene) => {
  getResolution();

  threeScene.scene.add(plane);
  const animate = () => {
    requestAnimationFrame(animate);
    threeScene.animate();
  };
  animate();
};

const vShader = `
varying vec2 v_uv;
varying vec3 v_position;

void main(){
    v_uv = uv;
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * .1,1.0);
}
`;
const fShader = `
varying vec2 v_uv;
varying vec3 v_position;
uniform vec2 u_resolution;
void main(){
    vec3 color = vec3(v_uv.x,v_uv.y,0.0);
    // vec3 color = vec3(v_position.x,v_position.y,0.0);
    // vec2 uv = gl_FragCoord.xy/u_resolution;
    // vec3 color = vec3(uv,0.0);
    gl_FragColor = vec4(color,1.0);
}
`;
const uniforms = {
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
