import * as THREE from 'three';

export function createTowerVisual(scene) {

    const size = 4;
    const height = 12;
    const thickness = 0.2;

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

    const half = size;

    const baseY = thickness / 2;
    const wallY = height / 2 + thickness / 2;

    // geometrie
    const wallX = new THREE.BoxGeometry(thickness, height, size * 2);
    const wallZ = new THREE.BoxGeometry(size * 2, height, thickness);
    const floor = new THREE.BoxGeometry(size * 2, thickness, size * 2);

    // BASE
    const base = new THREE.Mesh(floor, material);
    base.position.set(0, baseY, 0);
    scene.add(base);

    // PARETI
    const left = new THREE.Mesh(wallX, material);
    left.position.set(-half, wallY, 0);
    scene.add(left);

    const right = new THREE.Mesh(wallX, material);
    right.position.set(half, wallY, 0);
    scene.add(right);

    const front = new THREE.Mesh(wallZ, material);
    front.position.set(0, wallY, -half);
    scene.add(front);

    const back = new THREE.Mesh(wallZ, material);
    back.position.set(0, wallY, half);
    scene.add(back);

    // TETTO
    const roof = new THREE.Mesh(floor, material);
    roof.position.set(0, height + baseY, 0);
    scene.add(roof);

    // RAMPA (VISUALE)

    const levels = 4;
    const stepY = height / levels;

    const rampLength = size * 1.5;
    const rampThickness = 0.1;

    // geometria (Three usa size reale, non half-extents)
    const rampGeo = new THREE.BoxGeometry(
        rampLength,
        rampThickness,
        size * 2
    );

    const ramp = new THREE.Mesh(rampGeo, rampMaterial);

    // attaccata al muro sinistro (coerente con cannon: x = -size + rampHalfX)
    const rampHalf = rampLength / 2;
    const rampX = size - rampHalf;

    ramp.position.set(rampX, height - stepY, 0);

    // stessa inclinazione della fisica
    ramp.rotation.z = 0.7;

    scene.add(ramp);

    const ramp2 = new THREE.Mesh(rampGeo, rampMaterial);

    // stesso posizionamento CANNON
    const ramp2X = -size + rampHalf;
    const ramp2Y = height - stepY - 5;

    ramp2.position.set(
        ramp2X,
        ramp2Y,
        0
    );

    // stessa inclinazione opposta
    ramp2.rotation.z = -0.7;

    scene.add(ramp2);
}