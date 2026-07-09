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
const historyUI = document.getElementById("diceHistory");
const dropBtn = document.getElementById("dropD6");
const dropD20Btn = document.getElementById("dropD20");
const zargosButton = document.getElementById("zargosMode");
const zargosMenu = document.getElementById("zargosMenu");
const rollD8Button = document.getElementById("rollD8");
const rollD12Button = document.getElementById("rollD12");
const rollD20Button = document.getElementById("rollD20");

let zargosActive = false;

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

camera.position.z = 10;
camera.position.y = 16;
camera.position.x = 16;


const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// -------------------- CONTROLS --------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI / 2 - 0.01;
controls.minDistance = 15;   
controls.maxDistance = 30; 
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

function addToHistory(diceType, result) {

    const row = document.createElement("div");

    row.textContent = `${diceType} : ${result}`;

    historyUI.prepend(row);
}

// -------------------- BUTTON --------------------
document
    .getElementById("dropD6")
    .addEventListener("click", () => {

        resultUI.innerText = "Rullo di tamburi...";

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
    .getElementById("dropD8")
    .addEventListener("click", () => {

        resultUI.innerText = "Rullo di tamburi...";

        if (currentDiceType !== "d8") {
            switchDice("d8");
        }

        if (tower.state === "collapsed") {
            tower.reset(scene, world);
        }

        if (tower.state !== "collapsing") {
            dropDice();
        }
    });

document
    .getElementById("dropD12")
    .addEventListener("click", () => {

        resultUI.innerText = "Rullo di tamburi...";

        if (currentDiceType !== "d12") {
            switchDice("d12");
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

        resultUI.innerText = "Rullo di tamburi...";

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
    return dice.body.velocity.length() < 0.01 &&
           dice.body.angularVelocity.length() < 0.01;
}


function animate() {
    requestAnimationFrame(animate);

    world.step(1 / 60);

    syncDice(dice);

    renderer.render(scene, camera);
    controls.update();

    if (isDiceStopped(dice) && !resultShown) {
        resultShown = true;

        const value= dice.getValue();

        addToHistory(
            currentDiceType.toUpperCase(),
            value
        );

        resultUI.innerText = "Risultato: " + value;
        if (value == 1) {
            tower.collapse();
            //tower.collapseVisual(scene);
        }
        
    }
}

animate();

zargosButton.addEventListener("click", () => {

    zargosActive = !zargosActive;

    zargosMenu.style.display =
        zargosActive ? "flex" : "none";
});

window.addEventListener("keydown", (e) => {

    if (e.key === "1"){
        tower.collapse();
    }
});