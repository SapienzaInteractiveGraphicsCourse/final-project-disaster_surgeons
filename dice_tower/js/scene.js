import * as THREE from 'three';

function drawPip(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
}

function createDiceFaceTexture(number) {

    const canvas = document.createElement('canvas');

    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext('2d');

    // sfondo bianco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 256, 256);

    // bordo nero
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 256, 256);

    // numero
    ctx.fillStyle = 'black';
    ctx.fillStyle = 'black';

    ctx.fillStyle = 'black';

    const center = 128;
    const offset = 70;

    // ⚀
    if (number === 1) {
        drawPip(ctx, center, center);
    }

    // ⚁
    if (number === 2) {
        drawPip(ctx, center - offset, center - offset);
        drawPip(ctx, center + offset, center + offset);
    }

    // ⚂
    if (number === 3) {
        drawPip(ctx, center - offset, center - offset);
        drawPip(ctx, center, center);
        drawPip(ctx, center + offset, center + offset);
    }

    // ⚃
    if (number === 4) {
        drawPip(ctx, center - offset, center - offset);
        drawPip(ctx, center + offset, center - offset);
        drawPip(ctx, center - offset, center + offset);
        drawPip(ctx, center + offset, center + offset);
    }

    // ⚄
    if (number === 5) {
        drawPip(ctx, center - offset, center - offset);
        drawPip(ctx, center + offset, center - offset);
        drawPip(ctx, center, center);
        drawPip(ctx, center - offset, center + offset);
        drawPip(ctx, center + offset, center + offset);
    }

    // ⚅
    if (number === 6) {
        drawPip(ctx, center - offset, center - offset);
        drawPip(ctx, center + offset, center - offset);
        drawPip(ctx, center - offset, center);
        drawPip(ctx, center + offset, center);
        drawPip(ctx, center - offset, center + offset);
        drawPip(ctx, center + offset, center + offset);
    }


    return new THREE.CanvasTexture(canvas);
}

const loader = new THREE.TextureLoader();


export function createScene() {
    const scene = new THREE.Scene();
    const floorGeometry = new THREE.PlaneGeometry(60, 50);

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

  
    // =====================
    // LUCE AMBIENTE
    // =====================
    const ambient = new THREE.AmbientLight(
        0xffffff,
        0.4
    );
    scene.add(ambient);

    

    // =====================
    // SOLE
    // =====================
    // luce calda (tramonto)
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

    const helper = new THREE.CameraHelper(sun.shadow.camera);
    scene.add(helper);

    return { scene } 
}