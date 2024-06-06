import { ArrowHelper, Group, Material, MeshBasicMaterial, Object3D, Raycaster, Vector2, Vector3 } from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
  TrackballControls,
} from "three/examples/jsm/Addons";
import { ThreeScene } from "../../js/threeScene";
import { DrawModules } from "./drawModules";

export class LabelModules {

  lastEl?: HTMLDivElement;
  // 是否处于标注模式
  editModel: boolean = false;
  // 0:文本 1:箭头
  activeModel = -1;
  // 按钮面板 rootEl
  btnPlate!: HTMLDivElement;
  // 创建Raycaster和鼠标向量
  mouse = new Vector2();
  // 场景射线
  raycaster = new Raycaster();
  // ui 子菜单 list
  childList!: HTMLDivElement[];
  cssRenderer = new CSS3DRenderer();
  // 封装后的自定义 item list
  objList: DrawModules<Group>[] = [];
  // 自定义 item group 
  objGroup = new Group()
  constructor(public threeScene: ThreeScene) {
    this.initCss3DRenderer();
    this.initElement();
    this.initEventListener();
    threeScene.scene.add(this.objGroup);

  }
  initEventListener = () => {
    // 添加事件监听器
    this.threeScene.renderer.domElement.addEventListener(
      "pointerdown",
      this.onPointerDown,
      false
    );

  };
  initCss3DRenderer = () => {
    // CSS3D 渲染器
    const { cssRenderer } = this;
    const parentNode = this.threeScene.renderer.domElement
      .parentNode as HTMLDivElement;
    console.dir(parentNode);

    cssRenderer.setSize(parentNode.clientWidth, parentNode.clientHeight);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.top = "0px";
    cssRenderer.domElement.style.pointerEvents = "none";
    cssRenderer.domElement.classList.add("css3DRenderer");

    this.threeScene.renderer.domElement.parentNode!.appendChild(
      cssRenderer.domElement
    );
  };
  initElement = () => {
    const btnPlate = document.createElement("div");
    btnPlate.style.position = "fixed";
    btnPlate.style.top = "0px";
    btnPlate.style.left = "0px";
    btnPlate.style.backgroundColor = "black";
    btnPlate.style.display = "flex";
    btnPlate.style.justifyContent = "space-around";

    const modelList = ["查看模式", "标注模式"];
    const detailList = ["文本", "箭头"];
    const childList: HTMLDivElement[] = [];
    modelList.forEach((text) => {
      const div = document.createElement("div");
      div.textContent = text;
      div.style.backgroundColor = "white";
      div.style.padding = "1vMin";
      div.style.cursor = "default";
      btnPlate.appendChild(div);
    });
    this.lastEl = btnPlate.children.item(0) as HTMLDivElement;
    this.lastEl.style.backgroundColor = "skyBlue";
    detailList.forEach((text) => {
      const div = document.createElement("div");
      div.style.backgroundColor = "white";
      div.style.padding = "1vMin";
      div.style.cursor = "default";
      div.textContent = text;
      div.style.display = "none";
      childList.push(div);
      btnPlate.appendChild(div);
    });

    document.body.appendChild(btnPlate);

    btnPlate.addEventListener("click", (event: MouseEvent) => {
      if (event.target) {
        if (event.target instanceof HTMLElement) {
          if (event.target.innerText === "查看模式") {
            this.setControlsEnabled(true);
            this.setEditModel(false);
          } else if (event.target.innerText === "标注模式") {
            this.setControlsEnabled(false);
            this.setEditModel(true);
          }
        }
        this.setEditDetail(event.target as HTMLDivElement);
      }
    });
    this.btnPlate = btnPlate;
    this.childList = childList;
  };

  setEditModel = (val: boolean) => {
    this.editModel = val;
    this.setEditModelHandler(val);
    
  };
  setEditModelHandler = (val: boolean) => {
    for (let i = 0; i < this.btnPlate.children.length; i++) {
      const item = this.btnPlate.children.item(i) as HTMLDivElement;
      if (item.textContent!.length < 4)
        item.style.display = val ? "block" : "none";
    }
    this.objList.forEach(obj=>{
      obj.boundingBoxHelper.visible = false
    })
  };
  setEditDetail = (el: HTMLDivElement) => {
    if (this.lastEl) this.lastEl.style.backgroundColor = "white";
    el.style.backgroundColor = "skyBlue";
    const ind = this.childList.indexOf(el);
    this.activeModel = ind;
    this.lastEl = el;
  };
  setControlsEnabled = (val: boolean) => {
    this.threeScene.controls.enabled = val;
  };

  drawArrow = (raycaster: Raycaster) => {
    const { threeScene } = this;
    const intersects = raycaster.intersectObjects(threeScene.scene.children);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const direction = new Vector3(0, 1, 0);
      const length = 1;
      const hex = 0xffff00;

      const arrowHelper = new ArrowHelper(
        direction,
        intersect.point,
        length,
        hex
      );
      const arrowGroup = new Group()
      arrowGroup.add(arrowHelper)
      this.objGroup.add(arrowGroup)
      const arrowPointerMove = (event: PointerEvent) => {
        // console.log("平移");
        const { mouse, raycaster } = this;
        const { camera } = this.threeScene;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
    
        const intersects = raycaster.intersectObjects(
          this.threeScene.scene.children
        );
    
        if (intersects.length > 0) {
          const intersect = intersects[0];
          const direction = intersect.point
            .clone()
            .sub(arrowHelper.position)
            .normalize();
          const length = intersect.point.distanceTo(arrowHelper.position);
    
          arrowHelper.setDirection(direction);
          arrowHelper.setLength(length);
        }
      };
      threeScene.renderer.domElement.addEventListener(
        "pointermove",
        arrowPointerMove,
        false
      );
      const stopDraw = () => {
        
        const drawArrowIns = new DrawModules(
          arrowGroup,
          threeScene.camera
        );
        this.objList.push(drawArrowIns);
        arrowGroup.add(drawArrowIns.boundingBoxHelper!);
        // this.threeScene.scene.add(drawArrowIns.boundingBoxHelper)
        threeScene.renderer.domElement.removeEventListener(
          "pointerup",
          stopDraw
        );
        threeScene.renderer.domElement.removeEventListener(
          "pointermove",
          arrowPointerMove
        );
      };
      threeScene.renderer.domElement.addEventListener("pointerup", stopDraw);
    }
  };
  drawTextArea = (raycaster: Raycaster) => {
    const intersects = raycaster.intersectObjects(
      this.threeScene.scene.children
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];

      // 创建一个 div 元素作为文本标签
      const div = document.createElement("div");
      div.className = "label";
      div.contentEditable = "true"; // 使其可编辑
      div.innerHTML = "点击编辑文本";
      // 创建 CSS3D 对象
      div.style.pointerEvents = "none";
      const cssObject = new CSS3DObject(div);
      cssObject.position.copy(intersect.point);
      cssObject.scale.set(0.01, 0.01, 0.01);
      // 获取交点的法向量，并根据法向量设置标签的朝向
      const normal = intersect.face!.normal.clone();
      const lookAtPosition = intersect.point.clone().add(normal);
      cssObject.lookAt(lookAtPosition);
      console.log(cssObject);
      this.threeScene.scene.add(cssObject);
    }
  };

  onPointerDown = (event: PointerEvent) => {
    console.log("按下");
    const { mouse, raycaster, threeScene } = this;
    if (!this.editModel) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, threeScene.camera);
    const intersects = raycaster.intersectObjects(threeScene.scene.children);
    if (intersects.length > 0) {
      // 判断是否为自定义 item
      const inObjList = this.objList.findIndex(
        (obj) => obj.obj === intersects[0].object.parent
      );
      console.log(intersects[0],this.objList,inObjList);
      if (inObjList>=0) {
        console.log(this.objList[inObjList]);
        this.objList[inObjList].boundingBoxHelper.visible = true
      } else {
        console.log('执行');
        
        if (this.activeModel === 0) {
          this.drawTextArea(raycaster);
        } else if (this.activeModel === 1) {
          this.drawArrow(raycaster);
        }
      }
    }
  };

  animate = () => {
    this.cssRenderer.render(this.threeScene.scene, this.threeScene.camera);
    // this.trackballControls?.update()
  };
}
