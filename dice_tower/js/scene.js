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

export function createScene() {
    const scene = new THREE.Scene();
    const floorGeometry = new THREE.PlaneGeometry(20, 20);

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.0
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = 0;

    scene.add(floor);

  
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);


    const geometry = new THREE.BoxGeometry();
    console.log(geometry.groups);

    
    const materials = [
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(2) }), // +X
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(5) }), // -X
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(1) }), // +Y
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(6) }), // -Y
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(3) }), // +Z
        new THREE.MeshStandardMaterial({ map: createDiceFaceTexture(4) })  // -Z
    ];


    const cube = new THREE.Mesh(geometry, materials);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);

    cube.add(wireframe);
    scene.add(cube);

    return {
        scene,
        cube
    };
}