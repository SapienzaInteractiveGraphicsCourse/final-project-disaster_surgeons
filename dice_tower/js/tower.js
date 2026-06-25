import * as CANNON from 'cannon-es';

export function createTower(world) {

    // =========================
    // ROOT MODEL (LOGICAL)
    // =========================
    const tower = {
        bodies: {
            base: null,
            walls: [],
            ramps: []
        }
    };

    const thickness = 0.2;
    const height = 12;
    const size = 4;

    const half = size;

    const baseY = thickness / 2;
    const wallY = height / 2 + thickness / 2;

    // =========================
    // HELPERS
    // =========================
    function addBody(body, group) {
        world.addBody(body);
        group.push(body);
    }

    function createBox(x, y, z, w, h, d) {
        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
        });

        body.position.set(x, y, z);
        return body;
    }

    function createRamp(x, y, z, w, h, d, rotZ) {
        const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
        });

        body.position.set(x, y, z);
        body.quaternion.setFromEuler(0, 0, rotZ);

        return body;
    }

    // =========================
    // BASE (HIERARCHICAL NODE)
    // =========================
    tower.bodies.base = createBox(
        0, baseY, 0,
        size, thickness, size
    );

    world.addBody(tower.bodies.base);

    // =========================
    // WALLS (HIERARCHICAL NODE)
    // =========================
    const left = createBox(-half, wallY, 0, thickness, height, size);
    const right = createBox(half, wallY, 0, thickness, height, size);
    const front = createBox(0, wallY, -half, size, height, thickness);
    const back = createBox(0, wallY, half, size, height, thickness);

    tower.bodies.walls.push(left, right, front, back);

    left && world.addBody(left);
    right && world.addBody(right);
    front && world.addBody(front);
    back && world.addBody(back);

    // =========================
    // RAMPS (HIERARCHICAL NODE)
    // =========================
    const levels = 4;
    const stepY = height / levels;

    const rampLength = size * 1.5;
    const rampHalfX = rampLength / 2;
    const rampHalfZ = size;
    const rampThickness = 0.1;

    const ramp1 = createRamp(size - rampHalfX + 0.75,height - stepY,0,rampHalfX,rampThickness,rampHalfZ,0.7);

    tower.bodies.ramps.push(ramp1);
    world.addBody(ramp1);

    // RAMPA 2
    const ramp2 = createRamp(-size + rampHalfX - 0.75,height - stepY - 5,0,rampHalfX,rampThickness,rampHalfZ,-0.7);

    tower.bodies.ramps.push(ramp2);
    world.addBody(ramp2);

    // =========================
    // RETURN ROOT
    // =========================
    return tower;
}