import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
varying vec2 v_uv;
varying vec3 v_position;
void main(){
    v_uv = uv;
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`
const fShader = `
varying vec2 v_uv;
uniform float u_time;
varying vec3 v_position;
mat2 getRMat(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c); 
}
float inLine(float a,float b,float line_width,float thickness){
    float half_width = line_width * .5;
    return smoothstep(a - half_width - thickness,a - half_width,b) - smoothstep(a + half_width,a + half_width + thickness , b);
}
mat2 moveMat(float theta){
    return mat2(theta+1.0,0.0,0.0,0.0);
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
float sweep_line(vec2 pt ,vec2 center,float radius,float line_width,float edge_thickness){
    vec2 d = pt - center;
    float theta = u_time * 2.0;
    vec2 p = vec2(cos(theta),-sin(theta)) * radius;
    float h = clamp(dot(d,p)/dot(p,p),0.0,1.0);
    float l = length(d-p*h);
    return 1.0 - smoothstep(line_width,line_width + edge_thickness,l);
}
void main(){
    mat2 matR = getRMat(u_time);
    vec2 center = vec2(.5);
    // mat2 mMat = moveMat(u_time);
    vec2 p = v_uv;
    vec3 axis_color = vec3(0.8);
    vec3 color = inLine(v_uv.y,.5,.002,.001) * axis_color;
    color += inLine(v_uv.x,.5,.002,.001) * axis_color;
    color += lineCircles(v_uv,center,.3,.005,true) * axis_color;
    color += lineCircles(v_uv,center,.2,.005,true) *axis_color;
    color += lineCircles(v_uv,center,.1,.005,true) * axis_color;
    color += sweep_line(v_uv,vec2(0.5),.3,.001,.001) * vec3(.3,.5,.7); 
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = { u_time: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry(2,2);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    console.log(Math.sin(2.0));
    
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
    };
    animate();
}