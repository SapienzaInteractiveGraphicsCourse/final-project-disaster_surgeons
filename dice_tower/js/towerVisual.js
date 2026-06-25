import * as THREE from 'three';

export function createTowerVisual(scene) {

    const size = 4;
    const height = 12;
    const thickness = 0.2;

    // =========================
    // ROOT (HIERARCHICAL MODEL)
    // =========================
    const towerGroup = new THREE.Group();
    scene.add(towerGroup);

    // =========================
    // MATERIALS
    // =========================
    const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.5
    });

    const rampMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
    });

    // =========================
    // BASE
    // =========================
    const floorGeo = new THREE.BoxGeometry(size * 2, thickness, size * 2);
    const base = new THREE.Mesh(floorGeo, material);
    base.position.set(0, thickness / 2, 0);

    towerGroup.add(base);

    // =========================
    // WALLS GROUP
    // =========================
    const wallsGroup = new THREE.Group();
    towerGroup.add(wallsGroup);

    const wallX = new THREE.BoxGeometry(thickness, height, size * 2);
    const wallZ = new THREE.BoxGeometry(size * 2, height, thickness);

    const wallY = height / 2 + thickness / 2;
    const half = size;

    const left = new THREE.Mesh(wallX, material);
    left.position.set(-half, wallY, 0);
    wallsGroup.add(left);

    const right = new THREE.Mesh(wallX, material);
    right.position.set(half, wallY, 0);
    wallsGroup.add(right);

    const front = new THREE.Mesh(wallZ, material);
    front.position.set(0, wallY, -half);
    wallsGroup.add(front);

    const back = new THREE.Mesh(wallZ, material);
    back.position.set(0, wallY, half);
    wallsGroup.add(back);

    // =====================
    // =====================
    // FINESTRE
    // =====================
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x222244,
        transparent: true,
        opacity: 0.6
    });

    const windowGeo = new THREE.BoxGeometry(0.6, 0.6, 0.1);

    function addWindow(x, y, z, rotY = 0) {
        const w = new THREE.Mesh(windowGeo, windowMaterial);
        w.position.set(x, y, z);
        w.rotation.y = rotY;
        wallsGroup.add(w);
    }

    // lato frontale
    addWindow(-1, 6, half + 0.11);
    addWindow(1, 6, half + 0.11);
    addWindow(0, 8, half + 0.11);

    // lato sinistro
    addWindow(-half - 0.11, 5, 0, Math.PI / 2);
    addWindow(-half - 0.11, 8, 0, Math.PI / 2);

    // ARCO FRONTALE
    // =====================
    const archGroup = new THREE.Group();
    towerGroup.add(archGroup);

    const archMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9
    });

    // base porta
    const doorBaseGeo = new THREE.BoxGeometry(2, 2, thickness);
    const doorBase = new THREE.Mesh(doorBaseGeo, archMaterial);
    doorBase.position.set(0, 1, half + thickness / 2);
    archGroup.add(doorBase);

    // parte curva (semi arco)
    const archGeo = new THREE.CylinderGeometry(1, 1, thickness, 32, 1, false, 0, Math.PI);
    const archTop = new THREE.Mesh(archGeo, archMaterial);

    archTop.rotation.z = Math.PI / 2;
    archTop.position.set(0, 2, half + thickness / 2);

    archGroup.add(archTop);

    // =========================
    // ROOF
    // =========================
    const roof = new THREE.Mesh(floorGeo, material);
    roof.position.set(0, height + thickness / 2, 0);
    towerGroup.add(roof);
    // =====================
    // MERLI SUL TETTO
    // =====================
    const crenelGroup = new THREE.Group();
    towerGroup.add(crenelGroup);

    const crenelGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const crenelMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });

    const count = 8;
    const radius = size;

    for (let i = 0; i < count; i++) {

        const angle = (i / count) * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const crenel = new THREE.Mesh(crenelGeo, crenelMaterial);

        crenel.position.set(x, height + 0.6, z);

        crenel.lookAt(0, height, 0);

        crenelGroup.add(crenel);
    }

    // =========================
    // RAMPS GROUP
    // =========================
    const rampsGroup = new THREE.Group();
    towerGroup.add(rampsGroup);

    const levels = 4;
    const stepY = height / levels;

    const rampLength = size * 1.5;
    const rampThickness = 0.1;

    const rampGeo = new THREE.BoxGeometry(
        rampLength,
        rampThickness,
        size * 2
    );

    const rampHalf = rampLength / 2;

    // =========================
    // RAMPA 1
    // =========================
    const ramp1 = new THREE.Mesh(rampGeo, rampMaterial);

    ramp1.position.set(
        size - rampHalf + 0.75,
        height - stepY,
        0
    );

    ramp1.rotation.z = 0.7;

    rampsGroup.add(ramp1);

    // =========================
    // RAMPA 2
    // =========================
    const ramp2 = new THREE.Mesh(rampGeo, rampMaterial);

    ramp2.position.set(
        -size + rampHalf - 0.75,
        height - stepY - 5,
        0
    );

    ramp2.rotation.z = -0.7;

    rampsGroup.add(ramp2);

    // =========================
    // RETURN ROOT
    // =========================
    return towerGroup;
}