import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'https://unpkg.com/three@0.181.1/examples/jsm/controls/OrbitControls.js';

import { createScene } from './scene.js';
import { TowerModel } from './DiceTower.js';

// -------------------- WORLD --------------------
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// -------------------- SCENA --------------------
const { scene, cube } = createScene();

// -------------------- TORRE (MODELLO UNICO) --------------------
const tower = new TowerModel();
tower.buildCannon(world);
const towerMesh = tower.buildThree(scene);

// -------------------- UI --------------------
const resultUI = document.getElementById("diceResult");
const dropBtn = document.getElementById("dropDice");

// -------------------- GROUND --------------------
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// -------------------- DADO --------------------
const cubeBody = new CANNON.Body({
    mass: 0.1,
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
});

cubeBody.position.set(3, 15, 0);
cubeBody.angularDamping = 0.05;
cubeBody.linearDamping = 0.01;

world.addBody(cubeBody);

// -------------------- CAMERA --------------------
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 5;

// -------------------- RENDERER --------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// -------------------- CONTROLS --------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.update();

// -------------------- LOGICA DADO --------------------
let resultShown = false;
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

function dropDice() {
    resultShown = false;

    cubeBody.velocity.set(0, 0, 0);
    cubeBody.angularVelocity.set(0, 0, 0);

    cubeBody.position.set(2, 18, 0);   // più alto
    cubeBody.quaternion.set(0, 0, 0, 1);

    cubeBody.wakeUp();

    cubeBody.angularVelocity.set(
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15
    );
}
// -------------------- BUTTON --------------------
document
    .getElementById("dropDice")
    .addEventListener("click", () => {

        if (tower.state === "collapsed") {
            tower.reset(scene, world);
        }

        if (tower.state !== "collapsing") {
            dropDice();
        }
    });

const themeButtons = document.querySelectorAll(".themeBtn");

function setSelectedThemeUI(theme) {

    themeButtons.forEach(btn => {

        if (btn.dataset.theme === theme)
            btn.classList.add("active");
        else
            btn.classList.remove("active");
    });
}

themeButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        const theme = btn.dataset.theme;

        tower.changeTheme(theme);
        setSelectedThemeUI(theme);
    });
});
//inizialization
tower.changeTheme("medieval");
setSelectedThemeUI("medieval");

// spacebar
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") lanciaDado();
});

// -------------------- FACE LOGIC --------------------
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

// -------------------- ANIMATION LOOP --------------------
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
        if (value == 1) {
            tower.collapse();
            //tower.collapseVisual(scene);
        }
    }
}

animate();

window.addEventListener("keydown", (e) => {

    if (e.key === "1")
        tower.changeTheme("medieval");

    if (e.key === "2")
        tower.changeTheme("ice");

    if (e.key === "3")
        tower.changeTheme("madmax");

    if (e.key === "4")
        tower.changeTheme("cyber");
});