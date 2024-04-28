import * as THREE from 'three'
import { AmbientLight, BoxGeometry, Clock, Color, HemisphereLight, Mesh, PlaneGeometry, ShaderChunk, ShaderMaterial, Uniform, UniformsLib, UniformsUtils } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { lights_lambert_vertex } from '../shader-chunk/shader-chunk'
// ShaderChunk['lightsLambertVertex'] = lights_lambert_vertex

eventBus.on('threeScene', (data) => {
    
demoMounted(data);
});
const vShader = `
#include <common>
#include <lights_pars_begin>

uniform float u_time;
uniform float u_radius;

varying vec3 vPosition;
varying vec3 vLightIntensity;
varying vec3 vIndirectFront;


float getDelta(){
  return ((sin(u_time)+1.0)/2.0);
}

void main() {
  float delta = getDelta();
  vec3 vLightFront;
  vec3 objectNormal = delta * normal + (1.0 - delta) * normalize(position);


  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
//   #include <lights_lambert_vertex>
  ${lights_lambert_vertex}
  vLightIntensity = vLightFront + vIndirectFront+ambientLightColor;
  vPosition = position;

  vec3 v = normalize(position) * u_radius;
  vec3 pos = delta * position + (1.0 - delta) * v;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos * .3, 1.0 );
}
`
const fShader = `
varying vec3 vLightIntensity;

void main()
{
  vec3 color = vec3(.5);
  gl_FragColor = vec4(vLightIntensity * color, 1.0);
}
`
const uniforms = UniformsUtils.merge( [
    UniformsLib[ "common" ],
    UniformsLib[ "lights" ],
  ]); 
  uniforms.u_time = { value: 0.0 };
  uniforms.u_mouse = { value:{ x:0.0, y:0.0 }};
  uniforms.u_resolution = { value:{ x:0, y:0 }};
  uniforms.u_radius = { value: 2.0 };
const demoMounted = (threeScene:ThreeScene)=>{
const geometry = new BoxGeometry(2,2,2,8,8,8);
const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,lights:true,uniforms});
const box = new Mesh(geometry,material)
// threeScene.scene.background = new Color('#fff');
const controls = new OrbitControls(threeScene.camera,threeScene.renderer.domElement)
// const ambient = new AmbientLight('#fff',1)
const hemiSphere = new HemisphereLight('#fff','#444',1)
// threeScene.scene.add(ambient)
threeScene.scene.add(hemiSphere)
threeScene.scene.add(box) 
const clock = new Clock()
const animate = () => {
requestAnimationFrame(animate);
uniforms.u_time.value = clock.getElapsedTime()
controls.update()
threeScene.animate();
};
animate();
}