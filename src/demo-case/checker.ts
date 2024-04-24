import { Clock, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});
const vShader = `
varying vec2 v_uv;
void main(){
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.5,1.0);
}
`



const fShader = `
varying vec2 v_uv;
uniform float u_time;
mat2 getRMat(float theta){
    float s = sin(theta);
    float c = cos(theta);
    return mat2(c,-s,s,c); 
}

float inCell(float cellCount,float line_width){
    vec2 cellPos = fract(v_uv * cellCount);
    float inner = 1.0 - line_width;
    float outer = 0.0 + line_width;
    float horz = smoothstep(inner,1.0,cellPos.x) - smoothstep(0.0,outer,cellPos.x);
    float vert = smoothstep(inner,1.0,cellPos.y) - smoothstep(0.0,outer,cellPos.y);
    float cell = horz + vert > 1.0 ? 1.0 : horz+vert;
    return cell;

    // float cell = inCell(8.0,.1);
    // mat2 matR = getRMat(u_time);
}

void main(){
    // 沉船法: 分布式同步状态更新策略实现多 tiles 渲染
    float cellCount =3.0;
    float line_width = 0.1;
    float smooth_width = 0.04;

    // fract 取计算结果的小数部分, cellPos 的值为 (0,0)~(0.99...,0.99...),每个 cellPos 的 uv 坐标都会经历 0 ~ 1 的过程, .3=>.9 ,.4=>.2,.5=>.5,.6=>.8,.7=>.1  这样画出的 3x3 矩形
    vec2 cellPos = fract(v_uv * cellCount);

    // 内边((1,n)/(n,1) 的左/下)宽度
    float inner = 1.0 - line_width;

    // 外边((0,n)/(n,0) 的右/上)宽度
    float outer = 0.0 + line_width;

    // 内平滑区域设置
    float innerSmooth = inner - smooth_width;
    // 外平滑区域设置
    float outerSmooth = outer + smooth_width;

    // 平滑过度  smoothstep 通常情况下 (P2值小于P1时返回值相反) 小于 P1 返回 0,大于 P2 返回 1,之间返回 0-1 之间的平滑插值
    float horz = smoothstep(innerSmooth,inner,cellPos.x) + 1.0 - smoothstep(outer,outerSmooth,cellPos.x);
    // + 1.0 为了避免右边 smoothstep 值为 1 的情况（至于为啥，思考一下吧，调换右边 smoothstep 的 P1 P2 参数就能去掉 +1.0 ,但 smoothstep 默认设计就是 edge0 < edge1 的，虽然反过来也能用，但建议还是正着用）
    float vert = smoothstep(innerSmooth,inner,cellPos.y) + 1.0 - smoothstep(outer,outerSmooth,cellPos.y);

    // 判断是否重叠 ? 1.0 : 0 ~ 1 , 取消重叠量,cell 值为 0 ~ 1.0 之间
    float cell = horz + vert > 1.0 ? 1.0 : horz+vert;

    // 使用未处理过的 v_uv 坐标作为 r,g 值进行着色,v_uv 默认值从坐下(0,0)到右上(1,1),着色结果则是有 3x3 的矩形边框，颜色使用的还是最初的 v_uv 坐标（在顶点缓冲区中如果有定义 uv 坐标，则在 fragment shader 阶段每个像素点都将有着自己的 uv 初始坐标，通过图元装配、光栅化等过程计算平滑插值得来） (0,0)-(1,1)
    vec3 color = vec3(v_uv,0.0 ) * cell;
    gl_FragColor = vec4(color,1.0);
}
`



const uniforms = {u_time:{value:0}}
const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry();
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const plane = new Mesh(geometry, material)
    threeScene.scene.add(plane)
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        threeScene.animate();
    };
    animate();
}