import { AmbientLight, Clock, Mesh, MeshStandardMaterial, PlaneGeometry, ShaderMaterial } from 'three';
import type { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import eventBus from '../store';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const modelLoader = (url:string,threeScene:ThreeScene)=>{
    const GLTFLoaderIns =  new GLTFLoader()
    GLTFLoaderIns.setMeshoptDecoder(MeshoptDecoder);
    GLTFLoaderIns.load(url,GLTF=>{
        console.log(GLTF);
        GLTF.scene.traverse(obj=>{
            if(obj.type === 'Mesh'){
                //@ts-ignore
                if(obj.material.metalness === 1){
                //@ts-ignore
                    obj.material.metalness = 0
                }
            }
        })
        threeScene.scene.add(GLTF.scene)
    },progressEvent=>{
    
    },err=>{
        console.log(err);
        
    })
}

eventBus.on('threeScene', (data) => {
demoMounted(data);
});
const vShader = `
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0,1.0);
}
`
const fShader = `
void main(){
    vec3 color = vec3(1.0);
    gl_FragColor = vec4(color,1.0);
}
`

const uniforms = {u_time:{value:0}} 
const demoMounted = (threeScene:ThreeScene)=>{
modelLoader('/model/zipglb.glb',threeScene)
const light = new AmbientLight('#fff',1)
threeScene.scene.add(light)
const floor = new Mesh(new PlaneGeometry(10,10),new MeshStandardMaterial({color:"#eee"}))
floor.rotation.x = -Math.PI *.5
threeScene.scene.add(floor)
threeScene.camera.position.set(5,5,5)
// const geometry = new PlaneGeometry();
// const material = new ShaderMaterial({vertexShader:vShader,fragmentShader:fShader,uniforms});
// const plane = new Mesh(geometry,material)
// threeScene.scene.add(plane) 
const controls = new OrbitControls(threeScene.camera,threeScene.renderer.domElement)
const clock = new Clock()
const animate = () => {
requestAnimationFrame(animate);
uniforms.u_time.value = clock.getElapsedTime()
controls.update()
threeScene.animate();
};
animate();
}