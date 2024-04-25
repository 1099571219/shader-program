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
void main(){
    mat2 matR = getRMat(u_time);
    vec2 center = vec2(.5);
    mat2 mMat = moveMat(u_time);
    // mat2 pm = mat2(v_position.x,v_position.y,0.0,0.0) - mMat;
    // vec2 p = vec2(pm[0][0],pm[0][1]);
    vec2 p = v_uv;
    float line = inLine(p.y,mix(.1,.9,((sin(p.x *3.1415 *2.0)+1.0)/2.0)),.01,.001);
    vec3 color = vec3(1.0)* line;
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = { u_time: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry(2,2);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    console.log(Math.sin(.6));
    
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
    };
    animate();
}