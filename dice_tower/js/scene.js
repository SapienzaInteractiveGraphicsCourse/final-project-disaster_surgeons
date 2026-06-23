import * as THREE from 'three';

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

    floor.position.y = -1;

    scene.add(floor);

  
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);


    const geometry = new THREE.BoxGeometry();

    
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00
    });

    const cube = new THREE.Mesh(geometry, material);
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