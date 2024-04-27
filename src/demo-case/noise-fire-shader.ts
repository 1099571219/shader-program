import { Clock, Euler, Mesh, PlaneGeometry, ShaderMaterial, TextureLoader } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';
import { radToDeg } from 'three/src/math/MathUtils';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vshader = `
varying vec2 vUv;
void main() {	
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
const fshader = `
#define PI 3.141592653589
#define PI2 6.28318530718
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform float u_time;

varying vec2 vUv;

//Based on http://clockworkchilli.com/blog/8_a_fire_shader_in_glsl_for_your_webgl_games

void main (void)
{
  vec2 noise = vec2(0.0);
  float time = u_time;

  // Generate noisy x value
  vec2 uv = vec2(vUv.x*1.4 + 0.01, fract(vUv.y - time*0.69));
  noise.x = (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(vUv.x*0.5 - 0.033, fract(vUv.y*2.0 - time*0.12));
  noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(vUv.x*0.94 + 0.02, fract(vUv.y*3.0 - time*0.61));
  noise.x += (texture2D(u_tex, uv).w-0.5)*2.0;
  
  // Generate noisy y value
  uv = vec2(vUv.x*0.7 - 0.01, fract(vUv.y - time*0.27));
  noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(vUv.x*0.45 + 0.033, fract(vUv.y*1.9 - time*0.61));
  noise.y = (texture2D(u_tex, uv).w-0.5)*2.0;
  uv = vec2(vUv.x*0.8 - 0.02, fract(vUv.y*2.5 - time*0.51));
  noise.y += (texture2D(u_tex, uv).w-0.5)*2.0;
  
  noise = clamp(noise, -1.0, 1.0);

  float perturb = (1.0 - vUv.y) * 0.35 + 0.02;
  noise = (noise * perturb) + vUv - 0.02;

  vec4 color = texture2D(u_tex, noise);
  color = vec4(color.r*2.0, color.g*0.9, (color.g/color.r)*0.2, 1.0);
  noise = clamp(noise, 0.05, 1.0);
  color.a = texture2D(u_tex, noise).b*2.0;
  color.a = color.a*texture2D(u_tex, vUv).b;
//   color.a = 1.0;
  color = mix(vec4(.0,.0,.0,1.0),color,color.a);
  gl_FragColor = color;
}
`
const uniforms = { u_time: { value: 0 }, u_color_a: { value: { r: .9, g: .2, b: .0 } }, u_color_b: { value: { r: .9, g: .9, b: 0 } } ,u_tex: { value: new TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/flame.png") }}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry();
    const material = new ShaderMaterial({ vertexShader: vshader, fragmentShader: fshader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    console.log(Math.cos(Math.PI/4));
    
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
    };
    
    animate();
}

const x = 1.52*.7 + (-.36*-.7)
const y = 1.52*.7 + (-.36*.7)

console.log('x',x);
console.log('y',y);
