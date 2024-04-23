import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
varying vec3 vPos;
void main(){
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * .9,1.0);
}
`
const fShader = `
uniform float uTime;
varying vec3 vPos;
float inCircles(vec2 center,float radius,bool soften){
    float edge = soften ? radius *((sin(uTime*8.0)+1.0)/15.0) : 0.0;
    float distCenter = distance(center,vPos.xy);
    return smoothstep(distCenter-edge,distCenter+edge,radius); 
}

float lineCircles(vec2 pt,vec2 center,float radius,float  line_width,bool soften){
    vec2 p = pt - center;
    float len = length(p);
    float half_line_width = line_width * .5;
    float edge = soften ? line_width *.5 : 0.0;
    float inLen = radius-half_line_width;
    float outLen = radius+half_line_width;
    float res = step(inLen,len) - step(outLen,len);
    return smoothstep(inLen-edge,inLen+edge,len) - smoothstep(outLen-edge,outLen+edge,len);
}
mat2 getRMat(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c);
}
mat2 getSMat(float size){
    return mat2(size,0,0,size);
}
void main(){
    vec2 center = vec2(.0);
    mat2 matR = getRMat(uTime *.4);
    // mat2 matS = getSMat(1.0 / ((uTime/8.0) + 1.0));
    mat2 matS = getSMat(1.2);

    // float radius = .3 * (uTime/20.0 + 1.0);
    float radius = .5;
    // float circles = inCircles(center,radius,true);

    float lineC = lineCircles(vPos.xy,center,.5,.1,true);
    vec2 pt = matS * matR * vPos.xy;
    // vec3 color = vec3(pt,0.0) *circles;
    vec3 color = vec3(pt.x,.0,pt.y) * lineC;
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = { uTime: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    const clock = new Clock()
    const animate = () => {
        const time = clock.getElapsedTime()
        uniforms.uTime.value = time
        // plane.rotation.y+=Math.sin(time)*.05;
        requestAnimationFrame(animate);
        threeScene.animate();
    };
    animate();
}