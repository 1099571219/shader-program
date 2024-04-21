import * as THREE from "three";
export class ThreeScene {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;

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
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 设置相机位置
    this.camera.position.z = 1;

    window.addEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    const { camera, renderer } = this;
    // 更新相机的纵横比
    // camera.aspect = window.innerWidth / window.innerHeight;
    // 更新相机的投影矩阵。这是在改变纵横比后必须做的

    // 更新正交相机的宽高比
    // 假设相机的宽度固定，根据新的宽高比调整相机的高度
    // const aspect = window.innerWidth / window.innerHeight;
    // const cameraHeight = camera.top - camera.bottom; // 保持原始高度不变
    // const cameraWidth = cameraHeight * aspect; // 根据新的纵横比计算宽度
    // camera.left = -cameraWidth / 2;
    // camera.right = cameraWidth / 2;
    // top 和 bottom 保持不变，除非你也想根据某些条件调整它们
    camera.updateProjectionMatrix();

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  // 创建渲染循环
  public animate = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
