import {
    ACESFilmicToneMapping,
    Box3,
    BoxGeometry,
    Color,
    EquirectangularReflectionMapping,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Quaternion,
    Scene,
    Vector3,
    WebGLRenderer,
    sRGBEncoding,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let bones: any = [];
let time = 0;
const animationSpeed = 0.01;
const allCubes: any[] = [];
const allBoxes: any[] = [];
init();
animate();

function init() {
    const container = document.querySelector("#app") as HTMLElement;
    document.body.appendChild(container);

    camera = new PerspectiveCamera(
        73,
        window.innerWidth / window.innerHeight,
        0.25,
        20
    );
    camera.position.set(-1.8, 0.6, 2.7);

    scene = new Scene();

    new RGBELoader()
        .setPath("/public/")
        .load("venice_sunset_1k.hdr", (texture) => {
            texture.mapping = EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            const loader = new GLTFLoader().setPath("/public/");
            loader.load("tentacule_bones.glb", (gltf) => {
                const tentacule = gltf.scene;
                console.log(tentacule);

                let bone = tentacule.getObjectByName("Bone");
                let currentBone = bone?.children;

                while (!(currentBone === undefined) && currentBone.length > 0) {
                    bones.push(currentBone[0]);
                    currentBone = currentBone[0].children;
                }

                scene.add(tentacule);
                console.log(bones);
            });

            // for (let i = 0; i < 200; i++) {
            //   const x = Math.random() * 2 - 1;
            //   const y = Math.random() * 2 - 1;
            //   const z = Math.random() * 2 - 1;

            //   const cube = addCube(x, y, z);

            //   scene.add(cube);
            // }
            // render();

            animate();
        });

    // renderer
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = sRGBEncoding;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.target.set(0, 0, -0.2);
    controls.update();

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    animate();
}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    time += animationSpeed;

    // bones.forEach((bone: any, index: number) => {
    //     const angle = Math.sin(time + index * 0.5) * 0.3;
    //     bone.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), angle);
    //     bone.rotation.x = (Math.sin(Date.now() * 0.002) * 0.1 * index) / 3;
    // });
    bones[0].rotation.z =
        (Math.sin(Date.now() * 0.002) * 0.1 * bones.length) / 3;
    bones[1].rotation.x =
        (Math.sin(Date.now() * 0.002) * 0.1 * bones.length) / 3;
    bones[2].rotation.y =
        (Math.sin(Date.now() * 0.002) * 0.1 * bones.length) / 3;

    // allCubes.forEach((cube) => {
    //     let direction = new Vector3(
    //         Math.random() * 5,
    //         Math.random() * 5,
    //         Math.random() * 5
    //     );
    //     direction.subVectors(cube.position, scene.position);
    //     direction.normalize();
    //     cube.position.add(direction.multiplyScalar(-0.001));
    //     let collapse = false;

    //     allCubes.forEach((cube2) => {
    //         if (cube !== cube2) {
    //             const box = new Box3().setFromObject(cube);
    //             const box2 = new Box3().setFromObject(cube2);

    //             if (box.intersectsBox(box2)) {
    //                 collapse = true;
    //                 direction.subVectors(cube.position, cube2.position);
    //                 direction.normalize();
    //                 cube.position.add(direction.multiplyScalar(0.001));
    //             }
    //         }
    //     });

    //     // if (collapse) {
    //     //   cube.material.color.set(0xff0000);
    //     // } else {
    //     //   cube.material.color.set(0x00ff00);
    //     // }
    // });

    render();
}

function addCube(px: number, py: number, pz: number) {
    var colorandom = new Color(0xffffff);
    colorandom.setHex(Math.random() * 0xffffff);
    var geometry = new BoxGeometry(0.1, 0.1, 0.1); //x,y,z
    var boxMaterial = new MeshBasicMaterial({ color: colorandom });
    var cube = new Mesh(geometry, boxMaterial);

    cube.position.set(px, py, pz);
    cube.geometry.computeBoundingBox(); // null sinon
    allCubes.push(cube);
    scene.add(cube);
    return cube;
}
