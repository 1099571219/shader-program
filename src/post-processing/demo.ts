import {
  BoxGeometry,
  Clock,
  HemisphereLight,
  HemisphereLightHelper,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  TextureLoader,
} from "three";
import type { ThreeScene } from "../js/threeScene";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import eventBus from "../store/index";
import funina from "../assets/img/funina.avif";

eventBus.on("threeScene", (data) => {
  demoMounted(data);
});
const vShader = `
varying vec2 v_uv;
uniform vec2 v_tex_size;
void main(){
    // vec2 pos = vec2(position.x * v_tex_size.x,position.y * v_tex_size.y);
    // v_uv = uv;
    // vec2 pos = vec2(position.x * 2.0,position.y* 2.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;
const fShader = `
uniform sampler2D u_tex;
varying vec2 v_uv;
uniform vec2 u_tex_size;
void main(){
    // vec4 texColor = texture2D(u_tex,v_uv);
    vec4 texColor = vec4(u_tex_size.x*v_uv.x,u_tex_size.y*v_uv.y,0.0,1.0);
    gl_FragColor = texColor;
}
`;
const texLoader = new TextureLoader();
const tex = texLoader.load(funina, (tex: Texture) => {
  const { width, height } = tex.source.data;

  uniforms.u_tex_size.value.x = width * .002;
  uniforms.u_tex_size.value.y = height * .002;
  console.log(uniforms.u_tex_size);
  
});
const uniforms = {
  u_time: { value: 0 },
  u_tex: { value: tex },
  u_tex_size: { value: { x: 0, y: 0 } },
};

const demoMounted = (threeScene: ThreeScene) => {
  const geometry = new PlaneGeometry();
  console.log(geometry);
  
  const material = new ShaderMaterial({
    vertexShader: vShader,
    fragmentShader: fShader,
    uniforms,
  });
  const plane = new Mesh(geometry, material);
  threeScene.scene.add(plane);
  const boxGeo = new BoxGeometry(2, 2, 2);
  const boxMat = new MeshStandardMaterial({ color: "#bbbbbb" });
  const box = new Mesh(boxGeo, boxMat);
  //   threeScene.scene.add(box);

  const hemiLight = new HemisphereLight("#ffffff", "#aaaaaa", 1);
  const hemiLightHelper = new HemisphereLightHelper(hemiLight, 1, "red");
  threeScene.scene.add(hemiLightHelper);
  threeScene.scene.add(hemiLight);

  const controls = new OrbitControls(
    threeScene.camera,
    threeScene.renderer.domElement
  );
  const clock = new Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    controls.update();
    threeScene.animate();
  };
  animate();
};
