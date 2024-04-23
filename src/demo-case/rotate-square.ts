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
const fShader = `
varying vec3 v_position;
uniform float u_time;
//create rect
mat2 getRotationMatrix(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c);
}
mat2 getScaleMatrix(float scale){
    return mat2(scale,0.0,0.0,scale);
}
float inRect(vec2 pt,vec2 anchor,vec2 size,vec2 center){
    // vec2 p = pt.xy - center;
    vec2 p = pt.xy;
    vec2 halfSize = size*0.5;
    float horz = step(-halfSize.x - anchor.x ,p.x  ) - step(halfSize.x-anchor.x ,p.x);
    float vert = step(-halfSize.y - anchor.y,p.y ) - step(halfSize.y-anchor.y ,p.y );
    return horz * vert;
}
void main(){
    vec2 center = vec2(.5);
    mat2 matr = getRotationMatrix(u_time);
    mat2 mats = getScaleMatrix((sin(u_time)+2.0) *.5);
    vec2 pt = mats * matr * v_position.xy;
    float yellow = inRect(pt.xy,vec2(.15),vec2(0.3),center);
    vec3 color = vec3(1,1,0.0) * yellow;
    gl_FragColor = vec4(color,1.0);
}
`
const clock = new Clock()
const uniforms = {
    u_time: { value: 0 }
}
const demoMounted = (threeScene: ThreeScene) => {
    console.log(1);

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