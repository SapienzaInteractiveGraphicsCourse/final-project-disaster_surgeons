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
    console.log(geometry.groups);

    
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xff0000 }), // faccia 1
        new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // faccia 2
        new THREE.MeshStandardMaterial({ color: 0x0000ff }), // faccia 3
        new THREE.MeshStandardMaterial({ color: 0xffff00 }), // faccia 4
        new THREE.MeshStandardMaterial({ color: 0xff00ff }), // faccia 5
        new THREE.MeshStandardMaterial({ color: 0x00ffff })  // faccia 6
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