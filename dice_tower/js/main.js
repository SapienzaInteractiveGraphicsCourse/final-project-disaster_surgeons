import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'https://unpkg.com/three@0.181.1/examples/jsm/controls/OrbitControls.js';

import { createScene } from './scene.js';
import { TowerModel } from './DiceTower.js';
import { createDice } from "./dice.js";

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);


const { scene, cube } = createScene();

let currentDiceType = "d6";

const tower = new TowerModel();
tower.buildCannon(world);
const towerMesh = tower.buildThree(scene);


const resultUI = document.getElementById("diceResult");
const dropBtn = document.getElementById("dropD6");
const dropD20Btn = document.getElementById("dropD20");


const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

let dice = createDice(currentDiceType, scene, world);
dice.body.position.set(2, 18, 0);

function switchDice(type) {

    if (type === currentDiceType) return;

    currentDiceType = type;
    
    const oldPos = dice.body.position.clone();
    const oldQuat = dice.body.quaternion.clone();

    world.removeBody(dice.body);
    scene.remove(dice.visual);
    dice = createDice(type, scene, world);
}

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 15;
camera.position.y = 10;
camera.position.x = 10;


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

    dice.body.velocity.set(0, 0, 0);
    dice.body.angularVelocity.set(0, 0, 0);

    const randX = (Math.random() - 0.5) * 2;
    const randZ = (Math.random() - 0.5) * 2;

    dice.body.applyImpulse(
        new CANNON.Vec3(randX * strength, strength, randZ * strength),
        dice.body.position
    );
}

function dropDice() {
    resultShown = false;

    dice.body.velocity.set(0, 0, 0);
    dice.body.angularVelocity.set(0, 0, 0);

    dice.body.position.set(2, 18, 0);
    dice.body.quaternion.set(0, 0, 0, 1);

    dice.body.wakeUp();

    dice.body.angularVelocity.set(
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15,
        (Math.random()-0.5)*15
    );
}
// -------------------- BUTTON --------------------
document
    .getElementById("dropD6")
    .addEventListener("click", () => {

        if (currentDiceType !== "d6") {
            switchDice("d6");
        }
        if (tower.state === "collapsed") {
            tower.reset(scene, world);
        }

        if (tower.state !== "collapsing") {
            dropDice();
        }
    });

document
    .getElementById("dropD20")
    .addEventListener("click", () => {

        if (currentDiceType !== "d20") {
            switchDice("d20");
        }

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

function syncDice(dice) {
    dice.visual.position.copy(dice.body.position);
    dice.visual.quaternion.copy(dice.body.quaternion);
}

// spacebar
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") lanciaDado();
});



function isDiceStopped(dice) {
    return dice.body.velocity.length() < 0.02 &&
           dice.body.angularVelocity.length() < 0.02;
}

// -------------------- ANIMATION LOOP --------------------
function animate() {
    requestAnimationFrame(animate);

    world.step(1 / 60);

    syncDice(dice);

    renderer.render(scene, camera);
    controls.update();

    if (isDiceStopped(dice) && !resultShown) {
        resultShown = true;

        const value= dice.getValue();

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