import { AmbientLight, AxesHelper, Box3, Box3Helper, BoxGeometry, BufferGeometry, Clock, Color, Float32BufferAttribute, LineBasicMaterial, LineSegments, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, ShaderMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import { ThreeScene } from '../js/threeScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import eventBus from '../store';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
//@ts-ignore
import fonts from 'three/examples/fonts/helvetiker_regular.typeface.json'


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


const uniforms = { u_time: { value: 0 } }
const demoMounted = (threeScene: ThreeScene) => {
    const planeGeo = new PlaneGeometry(10, 10)
    const planeMat = new MeshStandardMaterial({ color: "#fff" })
    const plane = new Mesh(planeGeo, planeMat)
    plane.rotateX(-Math.PI / 2)
    plane.updateMatrixWorld()


    threeScene.camera.position.set(3, 3, 3)
    threeScene.camera.layers.enable(0)
    threeScene.camera.layers.enable(1)
    const geometry = new SphereGeometry(1, 1, 1);
    const material = new ShaderMaterial({ vertexShader: vShader, fragmentShader: fShader, uniforms });
    const polygon = new Mesh(geometry, material)

    const model = [plane, polygon]
    polygon.position.setY(1)

    polygon.geometry.computeBoundingBox()
    const polygonBox = polygon.geometry.boundingBox!
    // const polygonBoxHelper = new Box3Helper(polygonBox, 0xffffff)
    // polygonBoxHelper.layers.set(1)
    // polygon.add(polygonBoxHelper)

    // 创建一个用于存储顶点和颜色的数组
    const vertices: number[] = [];
    const colors: number[] = [];
    const xC =  new Color(0xff0000)
    const yC = new Color(0x00ff00)
    const zC = new Color(0x0000ff)
    const colorArray = [
        zC,
        yC,
        zC,
        yC,
        zC,
        yC,
        zC,
        yC,
        xC,
        xC,
        xC,
        xC
    ];
    // Box3 的 8 个顶点
    const points: Vector3[] = [
        new Vector3(polygonBox.min.x, polygonBox.min.y, polygonBox.min.z),
        new Vector3(polygonBox.min.x, polygonBox.min.y, polygonBox.max.z),
        new Vector3(polygonBox.min.x, polygonBox.max.y, polygonBox.min.z),
        new Vector3(polygonBox.min.x, polygonBox.max.y, polygonBox.max.z),
        new Vector3(polygonBox.max.x, polygonBox.min.y, polygonBox.min.z),
        new Vector3(polygonBox.max.x, polygonBox.min.y, polygonBox.max.z),
        new Vector3(polygonBox.max.x, polygonBox.max.y, polygonBox.min.z),
        new Vector3(polygonBox.max.x, polygonBox.max.y, polygonBox.max.z)
    ];
    // 定义 Box3 的 12 条边
    const edges = [0, 1, 1, 3, 3, 2, 2, 0, 4, 5, 5, 7, 7, 6, 6, 4, 0, 4, 1, 5, 2, 6, 3, 7];

    // 添加顶点和颜色
    edges.forEach((index, i) => {
        vertices.push(points[index].x, points[index].y, points[index].z);
        const color = colorArray[Math.floor(i/2)]
        colors.push(color.r, color.g, color.b);
    });
    // 创建几何体和材料
    const lineBuffer = new BufferGeometry();
    lineBuffer.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    lineBuffer.setAttribute('color', new Float32BufferAttribute(colors, 3));
    const lineMaterial = new LineBasicMaterial({ vertexColors: true });
    const lines = new LineSegments(lineBuffer, lineMaterial);
    // 将自定义的 Box3Helper 添加到场景或对象中
    polygon.add(lines);



    const pointer = new Vector2();
    const raycaster = new Raycaster()
    raycaster.layers.set(0)
    let boxHelper: Box3Helper | null = null

    const loader = new FontLoader();
    // 加载一个字体
    const font = loader.parse(fonts)
    const sizeX = polygonBox.max.x - polygonBox.min.x;
    const sizeY = polygonBox.max.y - polygonBox.min.y;
    const sizeZ = polygonBox.max.z - polygonBox.min.z;

    const textGeometry = new TextGeometry(`W: ${sizeX.toFixed(2)} H: ${sizeY.toFixed(2)} D: ${sizeZ.toFixed(2)}`, {
        font: font,
        size: .1,
        height: 0.05,
        depth: .01
    });
    const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new Mesh(textGeometry, textMaterial);
    // 调整文字位置
    textMesh.position.set(polygonBox.max.x, polygonBox.max.y, polygonBox.max.z);
    threeScene.scene.add(textMesh);

    function onPointerMove(event: MouseEvent) {
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, threeScene.camera)
        const intersects = raycaster.intersectObjects(model)
        let topObj = intersects[0]
        if (!topObj) return
        if (topObj && topObj.object.type === 'Mesh') {
            console.log(topObj);
            const object = topObj.object
            const newBoxHelper = object.children.find(obj => obj.type === 'Box3Helper')
            // if(boxHelper){
            //     if (newBoxHelper) newBoxHelper.visible = true
            // }
            // 获取物体的旋转矩阵
            const rotationMatrix = new Matrix4();
            rotationMatrix.extractRotation(topObj.object.matrixWorld);

            // 创建一个新的向量来存储变换后的法线
            const transformedNormal = topObj.face?.normal!.clone().applyMatrix4(rotationMatrix).normalize();

            const quat = new Quaternion()
            quat.setFromUnitVectors(new Vector3(0, 1, 0), transformedNormal!)

            axes.position.copy(topObj.point)
            axes.setRotationFromQuaternion(quat)
            // topObj.material
        }
    }


    threeScene.renderer.domElement.addEventListener('mousemove', onPointerMove)



    const controls = new OrbitControls(threeScene.camera, threeScene.renderer.domElement)

    const axes = new AxesHelper(1)
    threeScene.scene.add(new AmbientLight('#fff', 1))
    threeScene.scene.add(polygon)
    threeScene.scene.add(plane)
    threeScene.scene.add(axes)
    const clock = new Clock()
    const animate = () => {


        requestAnimationFrame(animate);
        uniforms.u_time.value = clock.getElapsedTime()
        controls.update()
        threeScene.animate();
    };
    animate();
}