import * as THREE from 'three';


const loader = new THREE.TextureLoader();


export function createScene() {
    const scene = new THREE.Scene();
    const floorGeometry = new THREE.CircleGeometry(60, 50);

    const texture = loader.load("./textures/grass/grass.jpg");
    // 
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.repeat.set(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        normalMap: loader.load("./textures/grass/normal.jpg"),
        roughnessMap: loader.load("./textures/grass/rough.jpg"),
        aoMap: loader.load("./textures/grass/ao.jpg"),
        displacementMap: loader.load("./textures/grass/displacement.jpg"),
        displacementScale: 0.05
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;

    floor.position.y = 0;

    scene.add(floor);

 
    const ambient = new THREE.AmbientLight(
        0xffffff,
        0.4
    );
    scene.add(ambient);

    //sun
    const sun = new THREE.DirectionalLight(0xffcc88, 2);

    sun.position.set(20, 30, 10);
    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;

    scene.add(sun);

    //const helper = new THREE.CameraHelper(sun.shadow.camera);
    //scene.add(helper);

    return { scene } 
}