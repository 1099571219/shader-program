import * as THREE from 'three';
import { Clock, Color, IcosahedronGeometry, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import eventBus from '../store';
import fireVitta from '../assets/img/explosion.png'
// import { noise } from '../shader-chunk/shader-chunk';


eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
#include <noise>

uniform float u_time;

varying vec2 vUv;
varying float vNoise;

void main() {	
  float time = u_time * 1.0;
  float displacement;
  float b;

  vUv = uv;
  
  // add time to the noise parameters so it's animated
  vNoise = 10.0 *  -.10 * turbulence( .5 * normal + time );
  b = 5.0 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
  displacement = - 10. * vNoise + b;

  // move the position along the normal and transform it
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
`
const fShader = `
#define PI 3.141592653589
#define PI2 6.28318530718

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform sampler2D u_tex;
varying float vNoise;
varying vec2 vUv;


float random( vec3 pt, float seed ){
    vec3 scale = vec3( 12.9898, 78.233, 151.7182 );
    return fract( sin( dot( pt + seed, scale ) ) * 43758.5453 + seed ) ;
  }

void main(){
float r = .01 * random( gl_FragCoord.xyz, 0.0 );
vec2 uv = vec2( 0, 1.3 * vNoise + r );
vec3 color = texture2D( u_tex, uv ).rgb;

gl_FragColor = vec4( color,1.0 );
// gl_FragColor = vec4( .4,.5,.6, 1.0 );
}
`
const uniforms = {
    u_time: { value: 0.0 },
    u_mouse: { value: { x: 0.0, y: 0.0 } },
    u_resolution: { value: { x: 0, y: 0 } },
    u_color: { value: new Color(0xb7ff00) },
    u_tex: { value: new THREE.TextureLoader().load(fireVitta)}
}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new IcosahedronGeometry(20, 8);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms, wireframe: false });
    const plane = new Mesh(geometry, material)
    const controls = new OrbitControls(threeScene.camera, threeScene.renderer.domElement)
    threeScene.scene.add(plane)
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        controls.update()
        threeScene.animate();
    };
    animate();
}