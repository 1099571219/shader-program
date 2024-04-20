import {
  BoxGeometry,
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
  demo1(threeScene);
  console.log(threeScene);
});
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

const demo1 = (threeScene: ThreeScene) => {
  // 创建一个立方体
  const geometry = new PlaneGeometry();

  const uniforms = {
    u_time: { value: 0 },
    u_mouse: { value: { x: 0, y: 0 } },
    u_resolution: { value: { x: 0, y: 0 } },
    u_color: { value: new Color(0x226344) },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: vShader,
    fragmentShader: fShader,
  });
  
  const move = (event:TouchEvent | MouseEvent)=>{
    if(event.type === 'mousemove'){
      const mouse = event as MouseEvent
      uniforms.u_mouse.value.x = mouse.clientX
      uniforms.u_mouse.value.y = mouse.clientY
    }else{
      const mouse = event as TouchEvent
      uniforms.u_mouse.value.x = mouse.touches[0].clientX
      uniforms.u_mouse.value.y = mouse.touches[0].clientY
    }
  }


  const getResolution =()=>{
    uniforms.u_resolution.value.x = window.innerWidth
    uniforms.u_resolution.value.y = window.innerWidth
  }
  getResolution()
  if('ontouchstart' in window){
    window.addEventListener('touchmove',move)
  }else{
    window.addEventListener('resize',getResolution)
    window.addEventListener('mousemove',move)
  }
  const plane = new Mesh(geometry, material);
  threeScene.scene.add(plane);
  
  const animate = () => {
    requestAnimationFrame(animate);
    // 旋转立方体
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    threeScene.animate();
  };
  animate();
};
