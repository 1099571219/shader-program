import {
  AmbientLight,
  ArrowHelper,
  AxesHelper,
  Box3,
  Box3Helper,
  BoxGeometry,
  BufferGeometry,
  Clock,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  Raycaster,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { ThreeScene } from "../js/threeScene";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import eventBus from "../store/index";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
//@ts-ignore
import fonts from "three/examples/fonts/helvetiker_regular.typeface.json";
import { LabelModules } from "./modules/labelModules";

eventBus.on("threeScene", (data) => {
  demoMounted(data);
});
const vShader = `
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`;
const fShader = `
void main(){
    vec3 color = vec3(1.0);
    gl_FragColor = vec4(color,1.0);
}
`;

const uniforms = { u_time: { value: 0 } };
const demoMounted = (threeScene: ThreeScene) => {

  // threeScene.controls.enabled = false;
  const planeGeo = new PlaneGeometry(10, 10);
  const planeMat = new MeshStandardMaterial({ color: "#ddd" });
  const plane = new Mesh(planeGeo, planeMat);

  plane.rotateX(-Math.PI / 2);
  plane.updateMatrixWorld();

  threeScene.camera.position.set(5, 5, 5);
  threeScene.camera.layers.enable(0);
  threeScene.camera.layers.enable(1);
  const geometry = new SphereGeometry(2, 10, 10);
  // const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
  const material = new PointsMaterial({ color: "#fff", size: 0.1 });

  const pointer = new Vector2();
  const raycaster = new Raycaster();
  raycaster.layers.set(0);

  const labelModules = new LabelModules(threeScene)

  const textMaterial = new MeshBasicMaterial({ color: 0xdddddd });
  const textMesh = new Mesh(geometry, textMaterial);
  const model = [plane, textMesh];
  textMesh.position.setY(2);

  // 调整文字位置
  threeScene.scene.add(textMesh);




  const { scene, camera } = threeScene;
 

  function onPointerMove(event: MouseEvent) {
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, threeScene.camera);
    const intersects = raycaster.intersectObjects(model);
    let topObj = intersects[0];
    if (!topObj) return;
    if (topObj && topObj.object.type === "Mesh") {
      const object = topObj.object;
      const newBoxHelper = object.children.find(
        (obj) => obj.type === "Box3Helper"
      );
      // if(boxHelper){
      //     if (newBoxHelper) newBoxHelper.visible = true
      // }
      // 获取物体的旋转矩阵
      const rotationMatrix = new Matrix4();
      rotationMatrix.extractRotation(topObj.object.matrixWorld);

      // 创建一个新的向量来存储变换后的法线
      const transformedNormal = topObj.face
        ?.normal!.clone()
        .applyMatrix4(rotationMatrix)
        .normalize();

      const quat = new Quaternion();
      quat.setFromUnitVectors(new Vector3(0, 1, 0), transformedNormal!);

      axes.position.copy(topObj.point);
      axes.setRotationFromQuaternion(quat);
      // topObj.material
    }
  }



  const axes = new AxesHelper(1);
  threeScene.scene.add(new AmbientLight("#fff", 1));
  threeScene.scene.add(plane);
  // threeScene.scene.add(axes);
  const clock = new Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    threeScene.animate();
    labelModules.animate()
  };
  animate();
};


