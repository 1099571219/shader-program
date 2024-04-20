import * as THREE from "three";
export class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor() {
    // 创建场景
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 设置相机位置
    this.camera.position.z = 0.1;

    window.addEventListener("resize",this.onWindowResize);
  }

  onWindowResize = () => {
    const { camera, renderer } = this;
    // 更新相机的纵横比
    camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机的投影矩阵。这是在改变纵横比后必须做的
    camera.updateProjectionMatrix();

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  // 创建渲染循环
  public animate = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
