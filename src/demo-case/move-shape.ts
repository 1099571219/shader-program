import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';
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
const fShader = `
varying vec3 v_position;
//create rect
float inRect(vec2 pt,vec2 size,vec2 center){
    vec2 p = pt.xy - center;
    vec2 halfSize = size*0.5;
    // float horz = (v_position.x>-halfSize.x && v_position.x<halfSize.x)? 1.0 : 0.0;
    float horz = step(-halfSize.x,p.x) - step(halfSize.x,p.x);
    float vert = step(-halfSize.y,p.y) - step(halfSize.y,p.y);
    return horz * vert;
}
void main(){
    float yellow = inRect(v_position.xy,vec2(.3),vec2(-.3,0.0));
    float green = inRect(v_position.xy,vec2(.4),vec2(.4,0.0));
    vec3 color = vec3(1.0,1.0,0.0) * yellow + vec3(0.0,1.0,0.0) * green;
    gl_FragColor = vec4(color,1.0);
}
`




// 16p

const uniforms = {}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    const animate = () => {
        requestAnimationFrame(animate);
        threeScene.animate();
    };
    animate();
}