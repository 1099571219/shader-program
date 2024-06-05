import * as THREE from "three";
import {lights_lambert_vertex,noise} from '../shader-chunk/shader-chunk'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// custom shader chunk
(THREE.ShaderChunk as any)['lights_lambert_vertex'] = lights_lambert_vertex;
(THREE.ShaderChunk as any)['noise'] = noise;


export class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls:OrbitControls
  constructor() {
    // 创建场景
    this.scene = new THREE.Scene();

    // 创建相机
    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   window.innerWidth / window.innerHeight,
    //   0.1,
    //   1000
    // );
    // this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    // 定义正交摄像机的视锥体边界
    const aspect = window.innerWidth / window.innerHeight;
    const height = 2 / aspect; // 计算高度跨度
    
    // 设置正交摄像机的边界
    // const left = -1;
    // const right = 1;
    // const top = height / 2;
    // const bottom = -height / 2;
    // const near = 0.1;
    // const far = 10;
    // this.camera = new THREE.OrthographicCamera(left, right, top, bottom,near, far)

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      .1,
      1000
    );


    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 轨道控制器
    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.target.set(0,0,0)

    // 设置相机位置
    this.camera.position.z = 5;

    window.addEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    const { camera, renderer } = this;
    // 更新透视相机的纵横比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    // 定义正交摄像机的视锥体边界
    // const aspect = window.innerWidth / window.innerHeight;
    // const height = 2 / aspect; // 计算高度跨度
    
    // 设置正交摄像机的边界
    // camera.top = height / 2;
    // camera.bottom = -height / 2;
    // camera.updateProjectionMatrix();

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  // 创建渲染循环
  public animate = () => {
    this.controls.update()
    this.renderer.render(this.scene, this.camera);
  };
}
