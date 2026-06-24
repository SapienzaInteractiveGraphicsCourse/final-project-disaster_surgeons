import * as CANNON from 'cannon-es';

export function createTower(world) {

    const thickness = 0.2;
    const height = 12;
    const size = 4;

    const half = size;

    const baseY = thickness / 2;
    const wallY = height / 2 + thickness / 2;

    function addWall(x, y, z, w, h, d) {
        const wall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
        });

        wall.position.set(x, y, z);
        world.addBody(wall);
    }

    // BASE
    addWall(0, baseY, 0, size, thickness, size);

    // PARETI
    addWall(-half, wallY, 0, thickness, height, size);
    addWall(half, wallY, 0, thickness, height, size);
    addWall(0, wallY, -half, size, height, thickness);
    addWall(0, wallY, half, size, height, thickness);

    // TETTO
    //addWall(0, height + baseY, 0, size, thickness, size);

    function addInclinedWall(x, y, z, w, h, d, rotZ) {
        const wall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
        });

        wall.position.set(x, y, z);
        wall.quaternion.setFromEuler(0, 0, rotZ);

        world.addBody(wall);
    }

    const levels = 4;
    const stepY = height / levels;

    const rampLength = size * 1.5; // lunghezza rampa
    const rampHalfX = rampLength / 2;
    const rampHalfZ = size;
    const rampThickness = 0.1;

    // rampa attaccata al muro sinistro (x = -size)
    const rampX = size - rampHalfX;

    addInclinedWall(rampX,height - stepY,0,rampHalfX,rampThickness,rampHalfZ,0.7);
    // seconda rampa (lato destro)
    const ramp2X = -size + rampHalfX;

    // leggermente sotto la fine della prima
    const ramp2Y = height - stepY - 5;

    addInclinedWall(ramp2X,ramp2Y,0,rampHalfX,rampThickness,rampHalfZ,-0.7);
}