import * as THREE from "three";
import * as CANNON from "cannon-es";

export class TowerModel {

    constructor() {

        // =====================
        // CONFIG (SOURCE OF TRUTH)
        // =====================
        this.size = 4;
        this.height = 12;
        this.thickness = 0.2;

        this.rampLength = this.size * 1.5;
        this.rampThickness = 0.1;

        this.levels = 4;
        this.stepY = this.height / this.levels;

        // =====================
        // HIERARCHY (LOGICAL MODEL)
        // =====================
        this.nodes = {
            base: null,
            walls: [],
            ramps: []
        };
    }

    // ======================================================
    // 🔵 CANNON BUILD
    // ======================================================
    buildCannon(world) {

        const size = this.size;
        const height = this.height;
        const thickness = this.thickness;

        const half = size;

        const baseY = thickness / 2;
        const wallY = height / 2 + thickness / 2;

        const addBody = (body, group) => {
            world.addBody(body);
            group.push(body);
        };

        const box = (x, y, z, w, h, d) => {
            const body = new CANNON.Body({
                mass: 1, 
                type: CANNON.Body.STATIC, 
                shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2))
            });

            body.position.set(x, y, z);
            return body;
        };

        const ramp = (x, y, z, w, h, d, rotZ) => {
            const body = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(w, h, d))
            });
            body.position.set(x, y, z);
            body.quaternion.setFromEuler(0, 0, rotZ);
            return body;
        };

        // =====================
        // BASE
        // =====================
        this.nodes.base = box(
            0, baseY, 0,
            size, thickness, size
        );
        world.addBody(this.nodes.base);

        // =====================
        // WALLS
        // =====================
        const left = box(-half, wallY, 0, thickness, height, size*2);
        const right = box(half, wallY+2, 0, thickness, height-4, size*2);
        const front = box(0, wallY, -half, size*2, height, thickness);
        const back = box(0, wallY, half, size*2, height, thickness);

        this.nodes.walls.push(left, right, front, back);

        [left, right, front, back].forEach(b => world.addBody(b));

        // =====================
        // RAMPS
        // =====================
        const rampHalf = this.rampLength / 2;

        const ramp1 = ramp(
            size - rampHalf + 0.75,
            height - this.stepY,
            0,
            rampHalf,
            this.rampThickness,
            size,
            0.7
        );

        const ramp2 = ramp(
            -size + rampHalf - 0.75,
            height - this.stepY - 5,
            0,
            rampHalf,
            this.rampThickness,
            size,
            -0.7
        );

        this.nodes.ramps.push(ramp1, ramp2);

        world.addBody(ramp1);
        world.addBody(ramp2);
    }

    // ======================================================
    // 🟢 THREE BUILD
    // ======================================================
    buildThree(scene) {

        const size = this.size;
        const height = this.height;
        const thickness = this.thickness;

        const towerGroup = new THREE.Group();
        scene.add(towerGroup);

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

        // =====================
        // WALLS
        // =====================
        const wallXL = new THREE.BoxGeometry(thickness, height, size * 2);
        const wallXR = new THREE.BoxGeometry(thickness, height-4, size * 2);
        const wallZ = new THREE.BoxGeometry(size * 2, height, thickness);

        const wallY = height / 2 + thickness / 2;
        const half = size;

        const wallsGroup = new THREE.Group();
        towerGroup.add(wallsGroup);

        const left = new THREE.Mesh(wallXL, material);
        left.position.set(-half, wallY, 0);

        const right = new THREE.Mesh(wallXR, material);
        right.position.set(half, 2 + wallY, 0);

        const front = new THREE.Mesh(wallZ, material);
        front.position.set(0, wallY, -half);

        const back = new THREE.Mesh(wallZ, material);
        back.position.set(0, wallY, half);

        wallsGroup.add(left, right, front, back);

        //MERLI
        const crenelGroup = new THREE.Group();
        towerGroup.add(crenelGroup);

        const crenelGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
        const crenelMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });

        const count = 5;
        const step = (size * 2) / count;

        // FRONT + BACK
        for (let i = 0; i < count; i++) {

            const x = 0.8 - size +i * step;

            const front = new THREE.Mesh(crenelGeo, crenelMaterial);
            front.position.set(x, height + 0.5, size);
            crenelGroup.add(front);

            const back = new THREE.Mesh(crenelGeo, crenelMaterial);
            back.position.set(x, height + 0.5, -size);
            crenelGroup.add(back);
        }

        // LEFT + RIGHT
        for (let i = 0; i < count; i++) {

            const z = 0.8 -size + i * step;

            const left = new THREE.Mesh(crenelGeo, crenelMaterial);
            left.position.set(-size, height + 0.5, z);
            left.rotation.y = Math.PI / 2;
            crenelGroup.add(left);

            const right = new THREE.Mesh(crenelGeo, crenelMaterial);
            right.position.set(size, height + 0.5, z);
            right.rotation.y = Math.PI / 2;
            crenelGroup.add(right);
        }
        // =====================
        // RAMPS
        // =====================
        const rampsGroup = new THREE.Group();
        towerGroup.add(rampsGroup);

        const rampLength = this.rampLength;
        const rampHalf = rampLength / 2;

        const rampGeo = new THREE.BoxGeometry(
            rampLength,
            this.rampThickness,
            size * 2
        );

        const ramp1 = new THREE.Mesh(rampGeo, rampMaterial);
        ramp1.position.set(
            size - rampHalf + 0.75,
            height - this.stepY,
            0
        );
        ramp1.rotation.z = 0.7;

        const ramp2 = new THREE.Mesh(rampGeo, rampMaterial);
        ramp2.position.set(
            -size + rampHalf - 0.75,
            height - this.stepY - 5,
            0
        );
        ramp2.rotation.z = -0.7;

        rampsGroup.add(ramp1, ramp2);

        this.visual = {
            towerGroup,
            wallsGroup,
            crenelGroup,
            rampsGroup
        };

        return towerGroup;
    }
    collapse() {
        const { towerGroup, wallsGroup, crenelGroup, rampsGroup } = this.visual;

        if (this._collapsing) return;
        this._collapsing = true;

        let t = 0;
        let pieces = [];
        let startedFall = false;

        const addGroup = (group, strength) => {
            group.children.forEach((obj) => {
                pieces.push({
                    obj,
                    vel: new THREE.Vector3(
                        (Math.random() - 0.5) * strength,
                        Math.random() * strength,
                        (Math.random() - 0.5) * strength
                    ),
                    rotVel: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2
                    ),
                    settled: false
                });
            });
        };

        const gravity = -0.015;
        const groundY = 0;

        const animate = () => {

            t += 0.05;

            // -------------------------
            // FASE 1: SOLO SHAKE
            // -------------------------
            if (t < 10) {
                towerGroup.rotation.z = Math.sin(t * 10) * 0.02;
                towerGroup.rotation.x = Math.cos(t * 12) * 0.02;
            }

            // -------------------------
            // FASE 2: INIZIA CROLLO (UNA SOLA VOLTA)
            // -------------------------
            if (t >= 10 && !startedFall) {

                startedFall = true;

                addGroup(wallsGroup, 0.2);
                addGroup(crenelGroup, 0.4);
                addGroup(rampsGroup, 0.6);
            }

            // -------------------------
            // FASE 3: FISICA CROLLO
            // -------------------------
            pieces.forEach(p => {

                if (p.settled) return;

                p.vel.y += gravity;
                p.obj.position.add(p.vel);

                p.obj.rotation.x += p.rotVel.x;
                p.obj.rotation.y += p.rotVel.y;
                p.obj.rotation.z += p.rotVel.z;

                if (p.obj.position.y <= groundY) {

                    p.obj.position.y = groundY;

                    p.vel.y *= -0.2;
                    p.vel.x *= 0.5;
                    p.vel.z *= 0.5;

                    p.rotVel.x *= 0.5;
                    p.rotVel.y *= 0.5;
                    p.rotVel.z *= 0.5;

                    if (
                        Math.abs(p.vel.x) < 0.01 &&
                        Math.abs(p.vel.y) < 0.01 &&
                        Math.abs(p.vel.z) < 0.01
                    ) {
                        p.settled = true;

                        p.vel.set(0, 0, 0);
                        p.rotVel.set(0, 0, 0);

                        p.obj.rotation.x = 0;
                        p.obj.rotation.z = 0;
                    }
                }
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}