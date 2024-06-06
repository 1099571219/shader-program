import {
  Box3,
  Box3Helper,
  Camera,
  Group,
  Line,
  Mesh,
  Object3D,
  Raycaster,
  Vector2,
  Vector3,
} from "three";

export class DrawModules<T extends Object3D> {
  boundingBox = new Box3();
  boundingBoxHelper: Box3Helper;
  // 变量用于拖拽操作
  dragging = false;
  dragObject: T | null = null;
  raycaster = new Raycaster();
  mouse = new Vector2();
  isActive = false
  constructor(public obj: T, public camera: Camera) {
    
    this.boundingBox.setFromObject(obj);
    this.boundingBoxHelper = new Box3Helper(this.boundingBox, "white");
    // 添加点击事件监听器
    // document.addEventListener("pointerdown", this.onPointerDown, false);
    // document.addEventListener("pointermove", this.onPointerMove, false);
    // document.addEventListener("pointerup", this.onPointerUp, false);
    
  }
  setActive = (val:boolean)=>{
    this.isActive = val
    this.obj.children.forEach((child:Object3D)=>{
      console.log(child);
      
    })
  }
  onPointerDown = (event: PointerEvent) => {
    const { mouse, raycaster, camera, obj } = this;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(obj);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log('intersect',intersect);
      console.log('obj',this.obj);

      // 设置拖拽对象
      this.dragObject = obj;
      this.dragging = true;

      // 使 CSS3DRenderer 接收事件
      obj.element.style.pointerEvents = "auto";
    }
  };

  onPointerMove = (event:PointerEvent) => {
    if (this.dragging && this.dragObject) {
        const {mouse,camera,raycaster,obj} = this
      // 更新拖拽对象的位置
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(obj);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        this.dragObject.position.copy(intersect.point);

        // 获取交点的法向量，并根据法向量设置标签的朝向
        const normal = intersect.face!.normal.clone();
        const lookAtPosition = intersect.point.clone().add(normal);
        this.dragObject.lookAt(lookAtPosition);
      }
    }
  };

  onPointerUp = () => {
    this.dragging = false;
    this.dragObject = null;
  };
}
