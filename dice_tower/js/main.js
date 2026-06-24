import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'https://unpkg.com/three@0.181.1/examples/jsm/controls/OrbitControls.js';
import { createScene } from './scene.js';


const { scene, cube } = createScene();
//cube.scale.set(3, 3, 3);

const resultUI = document.getElementById("diceResult");
//resultUI.innerText = "CIAO";

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

//ground
const groundBody = new CANNON.Body({
    mass: 0 // statico
});
groundBody.position.set(0, -1, 0);

const groundShape = new CANNON.Plane();
groundBody.addShape(groundShape);


groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

//muriinvisibili
function createWall(x, y, z, w, h, d) {
    const wall = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
    });

    wall.position.set(x, y, z);
    world.addBody(wall);
}
const s = 5;

createWall(-s, 0, 0, 0.1, 2, s);

createWall(s, 0, 0, 0.1, 2, s);

createWall(0, 0, -s, s, 2, 0.1);

createWall(0, 0, s, s, 2, 0.1);

createWall(0, 3, 0, 5, 0.1, 5);

world.addBody(groundBody);

const cubeBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
});
cubeBody.angularDamping = 0.4;
cubeBody.linearDamping = 0.2;

cubeBody.position.set(0, 3, 0);
world.addBody(cubeBody);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();


let resultShown = false;
function animate() {
    requestAnimationFrame(animate);

    world.step(1 / 60);

    cube.position.copy(cubeBody.position);
    cube.quaternion.copy(cubeBody.quaternion);

    renderer.render(scene, camera);
    controls.update();

    if (isDiceStopped(cubeBody) && !resultShown) {
    resultShown = true;

    const face = getTopFace(cubeBody);
    const value = faceValues[face];

    resultUI.innerText = "Risultato: " + value;
    }
}
animate();

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        lanciaDado();
    }
});

let strength = 6; 

function lanciaDado() {
    resultShown = false;
    cubeBody.velocity.set(0, 0, 0);
    cubeBody.angularVelocity.set(0, 0, 0);

    const randX = (Math.random() - 0.5) * 2;
    const randZ = (Math.random() - 0.5) * 2;

    cubeBody.applyImpulse(
        new CANNON.Vec3(randX * strength, strength, randZ * strength),
        cubeBody.position
    );
}

const faceNormals = [
    new CANNON.Vec3(0, 1, 0), 
    new CANNON.Vec3(0, -1, 0),  
    new CANNON.Vec3(1, 0, 0),
    new CANNON.Vec3(-1, 0, 0),
    new CANNON.Vec3(0, 0, 1),
    new CANNON.Vec3(0, 0, -1)
];
const faceValues = [1, 6, 2, 5, 3, 4];

function isDiceStopped(body) {
    return body.velocity.length() < 0.02 &&
           body.angularVelocity.length() < 0.02;
}

function getTopFace(body) {

    const upWorld = new CANNON.Vec3(0, 1, 0);
    let maxDot = -Infinity;
    let faceIndex = -1;

    for (let i = 0; i < faceNormals.length; i++) {

        const worldNormal = body.quaternion.vmult(faceNormals[i]);

        const dot = worldNormal.dot(upWorld);

        if (dot > maxDot) {
            maxDot = dot;
            faceIndex = i;
        }
    }

    return faceIndex;
}
