import { Clock, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from './modules/FirstPersonControls.js';
import eventBus from '../store';

eventBus.on('threeScene', (data) => {
    demoMounted(data);
});

const demoMounted = (threeScene: ThreeScene) => {
    const geometry = new PlaneGeometry();
    const material = new MeshBasicMaterial({ color: 'fff' })
    const plane = new Mesh(geometry, material)
    const controls = new FirstPersonControls(threeScene.camera, threeScene.renderer.domElement)
    controls.lookSpeed = 0.1; // 设置查看速度
    controls.movementSpeed = 10; // 设置移动速度
    controls.noFly = true; // 禁止飞行
    controls.lookVertical = true; // 允许垂直查看
    controls.constrainVertical = true; // 限制垂直查看角度
    controls.verticalMin = 1.1; // 设置垂直查看的最小角度
    controls.verticalMax = 2.2; // 设置垂直查看的最大角度

    threeScene.scene.add(plane)
    const clock = new Clock()
    const animate = () => {
        requestAnimationFrame(animate);
        controls.update(clock.getDelta())
        threeScene.animate();
    };
    animate();
}