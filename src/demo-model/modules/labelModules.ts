import { ArrowHelper, Raycaster, Vector2, Vector3 } from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
  TrackballControls,
} from "three/examples/jsm/Addons";
import { ThreeScene } from "../../js/threeScene";

export class LabelModules {
  lastEl?: HTMLDivElement;
  editModel: boolean = false;
  // 0:文本 1:箭头
  activeModel = -1;
  btnPlate: HTMLDivElement;
  // 创建Raycaster和鼠标向量
  mouse = new Vector2();
  arrowHelper: ArrowHelper | null = null;
  raycaster = new Raycaster();
  childList: HTMLDivElement[];
  cssRenderer = new CSS3DRenderer();
  trackballControls?: TrackballControls;
  constructor(public threeScene: ThreeScene) {
    this.initCss3DRenderer();
    // this.initTrackballControls();
    const { btnPlate, childList } = this.initElement();
    this.btnPlate = btnPlate;
    this.childList = childList;
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
    // 添加事件监听器
    threeScene.renderer.domElement.addEventListener(
      "pointerdown",
      this.onPointerDown,
      false
    );
    threeScene.renderer.domElement.addEventListener(
      "pointerup",
      this.onPointerUp,
      false
    );
  }
  // TrackballControls 控制器
  initTrackballControls = () => {
    const controls= new TrackballControls(this.threeScene.camera, this.threeScene.renderer.domElement);
    this.trackballControls = controls
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
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

    return {
      btnPlate,
      childList,
    };
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

      if (this.arrowHelper) {
        threeScene.scene.remove(this.arrowHelper);
      }

      this.arrowHelper = new ArrowHelper(
        direction,
        intersect.point,
        length,
        hex
      );
      threeScene.scene.add(this.arrowHelper);
      threeScene.renderer.domElement.addEventListener(
        "pointermove",
        this.arrowMouseMove,
        false
      );
    }
  };
  drawTextArea = (raycaster: Raycaster) => {
    const intersects = raycaster.intersectObjects(
      this.threeScene.scene.children
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];
      console.log(intersect);

      // 创建一个 div 元素作为文本标签
      const div = document.createElement("div");
      div.className = "label";
      div.contentEditable = "true"; // 使其可编辑
      div.innerHTML = "点击编辑文本";
      // 创建 CSS3D 对象
      div.style.pointerEvents = "none";
      const cssObject = new CSS3DObject(div);
      cssObject.scale.set(0.01, 0.01, 0.01);
      console.log(cssObject);
      cssObject.position.copy(intersect.point);
      this.threeScene.scene.add(cssObject);
    }
  };

  onPointerDown = (event: MouseEvent) => {
    console.log("按下");
    const { mouse, raycaster, threeScene } = this;
    if (!this.editModel) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, threeScene.camera);
    if (this.activeModel === 0) {
      this.drawTextArea(raycaster);
    } else if (this.activeModel === 1) {
      this.drawArrow(raycaster);
    }
  };

  arrowMouseMove = (event: MouseEvent) => {
    // console.log("平移");
    if (!this.arrowHelper) return;
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
        .sub(this.arrowHelper.position)
        .normalize();
      const length = intersect.point.distanceTo(this.arrowHelper.position);

      this.arrowHelper.setDirection(direction);
      this.arrowHelper.setLength(length);
    }
  };
  onPointerUp = () => {
    this.threeScene.renderer.domElement.removeEventListener(
      "pointermove",
      this.arrowMouseMove,
      false
    );
  };
  animate = () => {
    this.cssRenderer.render(this.threeScene.scene, this.threeScene.camera);
    // this.trackballControls?.update()
  };
}
