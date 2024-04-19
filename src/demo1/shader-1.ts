import {BoxGeometry, Mesh, MeshBasicMaterial, ShaderMaterial} from "three";
import type { ThreeScene } from "../js/threeScene";
import eventBus from "../store";

let threeScene;
eventBus.on("threeScene", (data) => {
  threeScene = data;
  demo1(threeScene);
  console.log(threeScene);
});


const demo1 = (threeScene: ThreeScene) => {
  // 创建一个立方体
  const geometry = new BoxGeometry();
  const material = new ShaderMaterial({ });
  const cube = new Mesh(geometry, material);
  threeScene.scene.add(cube);

  const animate = () => {
    requestAnimationFrame(animate);
    // 旋转立方体
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    threeScene.animate();
  };
  animate();
};
