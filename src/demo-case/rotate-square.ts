import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
varying vec3 v_position;
void main(){
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`
/*
sin(0) = 0
cos(0) = 1
sin(PI) = 0
cos(PI) = -1

mat2(c,-s,s,c)

theta = 0
s = 0
c = 1

theta = PI /2
s = 1
c = 0

theta = PI
s = 0
c = -1

theta = PI + PI * 0.5
s = -1
c = 0

theta = 2PI
s = 0
c = 1 

PI /2 mat2 = [[0,-1],[1,0]]
[3,2] => [-2,3]

PI mat2 = [[-1,0,0,-1]]
[3,2] => [-3,-2]

PI+PI*.5  mat2 = [[0,1],[-1,0]]
[3,2] => [2,-3]

*/

const fShader = `
varying vec3 v_position;
uniform float u_time;
//create rect
mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c);
}
float inRect(vec2 pt,vec2 size,vec2 center){
    vec2 p = pt.xy - center;
    vec2 halfSize = size*0.5;
    float horz = step(-halfSize.x,p.x) - step(halfSize.x,p.x);
    float vert = step(-halfSize.y,p.y) - step(halfSize.y,p.y);
    return horz * vert;
}
void main(){
    vec2 center = vec2(0.2);
    mat2 mat = getRotationMatrix(u_time);
    vec2 pt = mat * (v_position.xy - center) + center;
    float yellow = inRect(pt,vec2(.5),center);
    vec3 color = vec3(1.0,1.0,0.0) * yellow;
    gl_FragColor = vec4(color,1.0);
}
`
const clock = new Clock()
const uniforms = {
    u_time: { value: 0 }
}
const demoMounted = (threeScene: ThreeScene) => {

    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)

    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
    };
    animate();
}