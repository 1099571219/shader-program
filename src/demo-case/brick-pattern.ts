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
vec3 moveMat(float theta){
    return vec3(theta+1.0,0.0,0.0);
}

float brick(vec2 p,float mortar_height,float edge_thickness){
    float result = inLine(p.y,1.0,mortar_height,edge_thickness);
    result += inLine(p.y,0.5,mortar_height,edge_thickness);
    result += inLine(p.y,.0,mortar_height,edge_thickness);
    if(p.y > .5){
        p.x = fract(p.x + .5);
    }
    result += inLine(p.x,.5,mortar_height,edge_thickness);
    return result;
}


float mortar_height = .03;
float thickness = .02;
void main(){
    mat2 roMat = getRMat(u_time);
    vec3 mvMat = moveMat(u_time);
    vec2 p = fract(roMat* sin(mvMat.xy) + v_uv * 10.0);
    vec3 color =  mix(vec3(.5,0,0),vec3(.8),brick(p,mortar_height,thickness));
    gl_FragColor = vec4(color,1.0);
}
`
const uniforms = { u_time: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry(2, 2);
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