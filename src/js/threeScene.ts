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
    // this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    // 定义正交摄像机的视锥体边界
    const aspect = window.innerWidth / window.innerHeight;
    const height = 2 / aspect; // 计算高度跨度
    
    // 设置正交摄像机的边界
    const left = -1;
    const right = 1;
    const top = height / 2;
    const bottom = -height / 2;
    const near = 0.1;
    const far = 10;
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom,near, far)

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
    // 定义正交摄像机的视锥体边界
    const aspect = window.innerWidth / window.innerHeight;
    const height = 2 / aspect; // 计算高度跨度
    
    // 设置正交摄像机的边界
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    // 更新渲染器的大小
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  // 创建渲染循环
  public animate = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
