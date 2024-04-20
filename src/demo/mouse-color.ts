import {
  BoxGeometry,
  Clock,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import type { ThreeScene } from "../js/threeScene";
import eventBus from "../store";

let threeScene;
eventBus.on("threeScene", (data) => {
  threeScene = data;
  demoMounted(threeScene);
  console.log(threeScene);
});
const demoMounted = (threeScene: ThreeScene) => {
  getResolution();
  if ("ontouchstart" in window) {
    window.addEventListener("touchmove", move);
  } else {
    window.addEventListener("resize", getResolution);
    window.addEventListener("mousemove", move);
  }
  threeScene.scene.add(plane);
  const animate = () => {
    requestAnimationFrame(animate);
    threeScene.animate();
  };
  animate();
};


const vShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position*1.0,1.0);
}
`;
const fShader = `
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
void main(){
  vec3 color = vec3(u_mouse.x/u_resolution.x,0.0,u_mouse.y/u_resolution.y);
  gl_FragColor = vec4(color,.5);
}
`;
const uniforms = {
  u_time: { value: 0 },
  u_mouse: { value: { x: 0, y: 0 } },
  u_resolution: { value: { x: 0, y: 0 } },
  u_color: { value: new Color(0x226344) },
};

const move = (event: TouchEvent | MouseEvent) => {
  if (event.type === "mousemove") {
    const mouse = event as MouseEvent;
    uniforms.u_mouse.value.x = mouse.clientX;
    uniforms.u_mouse.value.y = mouse.clientY;
  } else {
    const mouse = event as TouchEvent;
    uniforms.u_mouse.value.x = mouse.touches[0].clientX;
    uniforms.u_mouse.value.y = mouse.touches[0].clientY;
  }
};


// 创建一个立方体
const geometry = new PlaneGeometry();
const material = new ShaderMaterial({
  uniforms,
  vertexShader: vShader,
  fragmentShader: fShader,
});
const plane = new Mesh(geometry, material);

const getResolution = () => {
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerWidth;
};


