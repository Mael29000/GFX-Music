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
let cube: Mesh;
var audio: any = document.getElementById("audio");
let analyser: any;
let dataArray: any;
// const cube:Mesh = addCube(0, 0, 0);
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
            // loader.load("tentacule_bones.glb", (gltf) => {
            //     const tentacule = gltf.scene;
            //     console.log(tentacule);

            //     let bone = tentacule.getObjectByName("Bone");
            //     let currentBone = bone?.children;

            //     while (!(currentBone === undefined) && currentBone.length > 0) {
            //         bones.push(currentBone[0]);
            //         currentBone = currentBone[0].children;
            //     }

            //     scene.add(tentacule);
            //     console.log(bones);
            // });

            cube = addCube(0, 0, 0);
            for (let i = 0; i < 100; i++) {
                const cube = addCube(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                );
                allCubes.push(cube);
                scene.add(cube);
            }

            play("/public/music.mp3");

            render();

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
    // console.log("cube", cube);

    // allCubes.forEach((cube) => {
    //     let direction = new Vector3(
    //         Math.random() * 5,
    //         Math.random() * 5,
    //         Math.random() * 5
    //     );
    //     direction.subVectors(cube.position, scene.position);
    //     direction.normalize();
    //     cube.position.add(direction.multiplyScalar(-0.01));
    //     let collapse = false;

    //     allCubes.forEach((cube2) => {
    //         if (cube !== cube2) {
    //             const box = new Box3().setFromObject(cube);
    //             const box2 = new Box3().setFromObject(cube2);

    //             if (box.intersectsBox(box2)) {
    //                 collapse = true;
    //                 direction.subVectors(cube.position, cube2.position);
    //                 direction.normalize();
    //                 cube.position.add(direction.multiplyScalar(1));
    //             }
    //         }
    //     });

    //     // if (collapse) {
    //     //   cube.material.color.set(0xff0000);
    //     // } else {
    //     //   cube.material.color.set(0x00ff00);
    //     // }
    // });

    requestAnimationFrame(animate);
    time += animationSpeed;

    const quaternion = new Quaternion();
    quaternion.setFromAxisAngle(new Vector3(0, 1, 0), 100);
    cube.applyQuaternion(quaternion);

    var lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1);
    var upperHalfArray = dataArray.slice(
        dataArray.length / 2 - 1,
        dataArray.length - 1
    );
    var sumLowerHalfArray = 0;
    var sumUpperHalfArray = 0;

    for (var i = 0; i < lowerHalfArray.length; i++) {
        sumLowerHalfArray += lowerHalfArray[i];
    }
    for (var i = 0; i < upperHalfArray.length; i++) {
        sumUpperHalfArray += upperHalfArray[i];
    }
    var averageLowerHalfArray: any = sumLowerHalfArray / lowerHalfArray.length;
    var averageUpperHalfArray: any = sumUpperHalfArray / upperHalfArray.length;

    averageLowerHalfArray = parseInt(averageLowerHalfArray, 10);
    averageUpperHalfArray = parseInt(averageUpperHalfArray, 10);

    if (analyser.getByteFrequencyData(dataArray) in lowerHalfArray) {
        const average: any = avg(lowerHalfArray);
        // cube.scale.set(average / 100, average / 100, average / 100);

        allCubes.forEach((cube) => {
            cube.scale.set(average / 1000, average / 1000, average / 1000);
            let direction = new Vector3(
                Math.random() * 5,
                Math.random() * 5,
                Math.random() * 5
            );
            direction.subVectors(cube.position, scene.position);
            direction.normalize();
            cube.position.add(direction.multiplyScalar(-0.1));
            let collapse = false;

            allCubes.forEach((cube2) => {
                if (cube !== cube2) {
                    const box = new Box3().setFromObject(cube);
                    const box2 = new Box3().setFromObject(cube2);

                    if (box.intersectsBox(box2)) {
                        collapse = true;
                        direction.subVectors(cube.position, cube2.position);
                        direction.normalize();
                        cube.position.add(direction.multiplyScalar(1));
                    }
                }
            });
        });
        allBoxes.forEach((box) => {
            box.scale.set(average / 1000, average / 1000, average / 1000);
        });

        // console.log("lowerHalfArray", lowerHalfArray);
    } else {
        const average: any = avg(upperHalfArray);

        allCubes.forEach((cube) => {
            cube.scale.set(average / 25, average / 25, average / 25);
            let direction = new Vector3(
                Math.random() * 5,
                Math.random() * 5,
                Math.random() * 5
            );
            direction.subVectors(cube.position, scene.position);
            direction.normalize();
            cube.position.add(direction.multiplyScalar(-0.01));
            let collapse = false;

            allCubes.forEach((cube2) => {
                if (cube !== cube2) {
                    const box = new Box3().setFromObject(cube);
                    const box2 = new Box3().setFromObject(cube2);

                    if (box.intersectsBox(box2)) {
                        collapse = true;
                        direction.subVectors(cube.position, cube2.position);
                        direction.normalize();
                        cube.position.add(direction.multiplyScalar(1));
                    }
                }
            });
        });
        allBoxes.forEach((box) => {
            box.scale.set(average / 25, average / 25, average / 25);
        });

        // cube.scale.set(average / 5, average / 5, average / 5);
        // console.log("upperHalfArray", upperHalfArray);
    }

    render();
}

function addCube(px: number, py: number, pz: number) {
    var colorandom = new Color(0xffffff);
    colorandom.setHex(Math.random() * 0xffffff);
    var geometry = new BoxGeometry(0.2, 0.2, 0.2); //x,y,z
    var boxMaterial = new MeshBasicMaterial({ color: colorandom });
    var cube = new Mesh(geometry, boxMaterial);

    cube.position.set(px, py, pz);
    cube.geometry.computeBoundingBox(); // null sinon
    allCubes.push(cube);
    scene.add(cube);
    return cube;
}

function play(e: any) {
    console.log(audio);
    console.log(e);
    audio.src = e; // URL.createObjectURL(e);
    audio.load();
    audio.play();

    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function avg(arr: any) {
    var total = arr.reduce(function (sum: any, b: any) {
        return sum + b;
    });
    return total / arr.length;
}

function max(arr: any) {
    return arr.reduce(function (a: any, b: any) {
        return Math.max(a, b);
    });
}
