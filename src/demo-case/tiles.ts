import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
varying vec2 vUv;
void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.5,1.0);
}
`
const fShader = `
varying vec2 vUv;
uniform float uTime;
float inRect(vec2 pt,vec2 size,vec2 center){
    vec2 halfSize = size *.5;
    float horz = step(-halfSize.x,pt.x) - step(halfSize.x,pt.x);
    float vert = step(-halfSize.y,pt.y) - step(halfSize.y,pt.y);
    return horz * vert;
}
mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c);
}
mat2 getScaleMatrix(float size){
    return mat2(size,0.0,0.0,size);
}
void main(){
    vec2 size = vec2(.5);
    vec2 center = vec2(0.0);
    float tileCount = 6.0;
    mat2 matR = getRotationMatrix(uTime);
    mat2 matS = getScaleMatrix((cos(uTime)+3.0)*.5);
    vec2 tile = matS * matR * (fract(vUv * tileCount) - vec2(.35));
    float rect = inRect(tile,size,center);
    vec2 pt = matR * vUv;
    vec3 color = vec3(pt,cos(uTime)) * rect;
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = {uTime:{value:0}} 
const demoMounted = (threeScene:ThreeScene)=>{
const clock = new Clock()

const geometry = new PlaneGeometry();
const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,uniforms});
const plane = new Mesh(geometry,material)
threeScene.scene.add(plane) 
const animate = () => {
requestAnimationFrame(animate);
uniforms.uTime.value = clock.getElapsedTime()
threeScene.animate();
};
animate();
}