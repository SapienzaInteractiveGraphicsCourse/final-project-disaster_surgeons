import * as THREE from "three";
import * as CANNON from "cannon-es";

const loader = new THREE.TextureLoader();

export class TowerModel {

    constructor() {

        // =====================
        // CONFIG (SOURCE OF TRUTH)
        // =====================
        this.size = 4;
        this.height = 12;
        this.visualThickness = 0.5;
        this.physicalThickness = 0.5;

        this.rampLength = this.size * 1.5;
        this.rampThickness = 0.25;

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

        this.state = "idle"; 
        this.currentTheme = "medieval";

    }

    // ======================================================
    // 🔵 CANNON BUILD
    // ======================================================
    buildCannon(world) {

        const size = this.size;
        const height = this.height;
        const physicalThickness = this.physicalThickness;

        const half = size;

        const baseY = physicalThickness / 2;
        const wallY = height / 2 + physicalThickness / 2;

        const addBody = (body, group) => {
            world.addBody(body);
            group.push(body);
        };

        const box = (x, y, z, w, h, d) => {
            const body = new CANNON.Body({
                mass: 0, 
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
            size, physicalThickness, size
        );
        world.addBody(this.nodes.base);

        // =====================
        // WALLS
        // =====================
        const left = box(-half, wallY, 0, physicalThickness, height, size*2);
        const right = box(half, wallY+2, 0, physicalThickness, height-4, size*2);
        const front = box(0, wallY, -half, size*2, height, physicalThickness);
        const back = box(0, wallY, half, size*2, height, physicalThickness);

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
        const visualThickness = this.visualThickness;

        const towerGroup = new THREE.Group();
        scene.add(towerGroup);
        
        this.materials = {

            wall: new THREE.MeshStandardMaterial({
                map: loader.load("./textures/stone/rocks.jpg"),
                normalMap: loader.load("./textures/stone/normal.jpg"),
                roughnessMap: loader.load("./textures/stone/rough.jpg"),
                aoMap: loader.load("./textures/stone/ao.jpg")
                //displacementMap: loader.load("./textures/stone/displacement.jpg"),
                //displacementScale: 0.05
                //metalness: 0.1,
                //transparent: true,
            }),

            ramp: new THREE.MeshStandardMaterial({
                map: loader.load("./textures/wood/wood.jpg"),
                normalMap: loader.load("./textures/wood/normal.jpg"),
                roughnessMap: loader.load("./textures/wood/rough.jpg"),
                aoMap: loader.load("./textures/wood/ao.jpg")
                //displacementMap: loader.load("./textures/stone/displacement.jpg"),
                //displacementScale: 0.05
                //metalness: 0.1,
                //transparent: true,
            }),

            crenel: new THREE.MeshStandardMaterial({
                map: loader.load("./textures/rock/rock.jpg"),
                normalMap: loader.load("./textures/rock/normal.jpg"),
                roughnessMap: loader.load("./textures/rock/rough.jpg"),
                aoMap: loader.load("./textures/rock/ao.jpg")
                //displacementMap: loader.load("./textures/stone/displacement.jpg"),
                //displacementScale: 0.05
                //metalness: 0.1,
                //transparent: true,
            })
        };


        const material = this.materials.wall;

        const rampMaterial = this.materials.ramp;

        // =====================
        // WALLS
        // =====================
        const wallXL = new THREE.BoxGeometry(visualThickness, height, size * 2);
        const wallXR = new THREE.BoxGeometry(visualThickness, height-4, size * 2 + 0.49);
        const wallZ = new THREE.BoxGeometry(size * 2, height, visualThickness);

        const wallY = height / 2;
        const half = size;

        const wallsGroup = new THREE.Group();
        towerGroup.add(wallsGroup);

        const left = new THREE.Mesh(wallXL, material);
        left.position.set(-half, wallY, 0);
        left.castShadow = true;
        left.receiveShadow = true;

        const right = new THREE.Mesh(wallXR, material);
        right.position.set(half, 2 + wallY, 0);
        right.castShadow = true;
        right.receiveShadow = true;

        const front = new THREE.Mesh(wallZ, material);
        front.position.set(0, wallY, -half);
        front.castShadow = true;
        front.receiveShadow = true;

        const back = new THREE.Mesh(wallZ, material);
        back.castShadow = true;
        back.receiveShadow = true;
        back.position.set(0, wallY, half);

        wallsGroup.add(left, right, front, back);

        //MERLI
        const crenelGroup = new THREE.Group();
        towerGroup.add(crenelGroup);

        const crenelGeo = new THREE.BoxGeometry(1.0, 0.8, 0.25);
        const crenelMaterial = this.materials.crenel;

        const count = 5;
        const step = (size * 2) / count;

        // FRONT + BACK
        for (let i = 0; i < count; i++) {

            const x = 0.8 - size +i * step;

            const front = new THREE.Mesh(crenelGeo, crenelMaterial);
            front.castShadow= true;
            front.receiveShadow= true;
            front.position.set(x, height + 0.35, size);
            crenelGroup.add(front);

            const back = new THREE.Mesh(crenelGeo, crenelMaterial);
            back.castShadow= true;
            back.receiveShadow= true;
            back.position.set(x, height + 0.35, -size);
            crenelGroup.add(back);
        }

        // LEFT + RIGHT
        for (let i = 0; i < count; i++) {

            const z = 0.8 -size + i * step;

            const left = new THREE.Mesh(crenelGeo, crenelMaterial);
            left.castShadow= true;
            left.receiveShadow= true;
            left.position.set(-size, height + 0.35, z);
            left.rotation.y = Math.PI / 2;
            crenelGroup.add(left);

            const right = new THREE.Mesh(crenelGeo, crenelMaterial);
            right.castShadow= true;
            right.receiveShadow= true;
            right.position.set(size, height + 0.35, z);
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
        ramp1.castShadow = true;
        ramp1.receiveShadow = true;
        ramp1.position.set(
            size - rampHalf + 0.75,
            height - this.stepY,
            0
        );
        ramp1.rotation.z = 0.7;

        const ramp2 = new THREE.Mesh(rampGeo, rampMaterial);
        ramp2.castShadow = true;
        ramp2.receiveShadow = true;
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
        this.state = "collapsing";

        let t = 0;
        let pieces = [];
        let startedFall = false;

        const addGroup = (group, type,strength) => {
            group.children.forEach((obj) => {
                pieces.push({
                    obj,
                    type,
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

                wallsGroup.children.forEach((obj, i) => {

                    let subtype = "wall";

                    if (i === 0) subtype = "wall_left";
                    if (i === 1) subtype = "wall_right";
                    if (i === 2) subtype = "wall_front";
                    if (i === 3) subtype = "wall_back";

                    pieces.push({
                        obj,
                        type: subtype,

                        vel: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.2,
                            Math.random() * 0.2,
                            (Math.random() - 0.5) * 0.2
                        ),

                        rotVel: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.2,
                            (Math.random() - 0.5) * 0.2,
                            (Math.random() - 0.5) * 0.2
                        ),

                        settled: false
                    });
                });
                addGroup(crenelGroup, "crenel", 0.4);
                addGroup(rampsGroup, "ramp", 0.6);
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

                        // STOP TOTALE DINAMICA
                        p.vel.set(0, 0, 0);
                        p.rotVel.set(0, 0, 0);

                        // IMPORTANTISSIMO: annulla rotazione residua “instabile”
                        p.obj.rotation.x = 0;
                        p.obj.rotation.y = p.obj.rotation.y; // la manteniamo
                        p.obj.rotation.z = 0;

                        if (p.type === "wall_left" || p.type === "wall_right") {
                            p.obj.rotation.x = 0;
                            p.obj.rotation.y = 0;
                            p.obj.rotation.z = Math.PI / 2;
                        }

                        else if (p.type === "wall_front" || p.type === "wall_back") {
                            p.obj.rotation.x = Math.PI / 2;
                            p.obj.rotation.z = 0;
                            p.obj.rotation.y = 0;
                        }

                        else if (p.type == "crenel") {
                            p.obj.rotation.x = Math.PI / 2;
                            p.obj.rotation.y = 0;
                            p.obj.rotation.z = 0;
                        }

                        else if (p.type == "ramp") {
                            p.obj.rotation.x = 0;
                            p.obj.rotation.y = 0;
                            p.obj.rotation.z = 0;
                        }

                        // IMPORTANTISSIMO: forza anche posizione stabile
                        p.obj.position.y = groundY+0.05 + Math.random() * 0.1;
                    }
                    
                }
            });

            requestAnimationFrame(animate);
        };
        this.state = "collapsed";
        animate();
    }

    reset(scene, world) {

        const { towerGroup } = this.visual;

        // rimuovi visuale
        scene.remove(towerGroup);
        world.removeBody(this.nodes.base);

        // reset stato
        this.state = "idle";
        this._collapsing = false;

        // ricostruisci
        this.buildCannon(world);
        this.buildThree(scene);

        this.changeTheme(this.currentTheme);
    }

    changeTheme(theme) {

        this.currentTheme = theme;

        if (theme === "medieval") {


            this.materials.wall.map =loader.load("./textures/stone/rocks.jpg");
            this.materials.wall.normalMap =loader.load("./textures/stone/normal.jpg");
            this.materials.wall.roughnessMap =loader.load("./textures/stone/rough.jpg");
            this.materials.wall.aoMap =loader.load("./textures/stone/ao.jpg");
            this.materials.wall.metalnessMap = null;
            this.materials.wall.metalness = 0;

            this.materials.ramp.map =loader.load("./textures/wood/wood.jpg");
            this.materials.ramp.normalMap =loader.load("./textures/wood/normal.jpg");
            this.materials.ramp.roughnessMap =loader.load("./textures/wood/rough.jpg");
            this.materials.ramp.aoMap =loader.load("./textures/wood/ao.jpg");
            this.materials.ramp.metalnessMap = null;
            this.materials.ramp.metalness = 0;

            this.materials.crenel.map =loader.load("./textures/rock/rock.jpg");
            this.materials.crenel.normalMap =loader.load("./textures/rock/normal.jpg");
            this.materials.crenel.roughnessMap =loader.load("./textures/rock/rough.jpg");
            this.materials.crenel.aoMap =loader.load("./textures/rock/ao.jpg");
            this.materials.crenel.metalnessMap = null;
            this.materials.crenel.metalness = 0;

        }


        else if (theme === "ice") {

            this.materials.wall.map =loader.load("./textures/ice/ice.jpg");
            this.materials.wall.normalMap =loader.load("./textures/ice/normal.jpg");
            this.materials.wall.roughnessMap =loader.load("./textures/ice/rough.jpg");
            //this.materials.wall.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.wall.aoMap = null;
           // this.materials.wall.metalness = 0.8;

            this.materials.ramp.map =loader.load("./textures/ice/ice.jpg");
            this.materials.ramp.normalMap =loader.load("./textures/ice/normal.jpg");
            this.materials.ramp.roughnessMap =loader.load("./textures/ice/rough.jpg");
            //this.materials.ramp.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.ramp.aoMap = null;
            //this.materials.ramp.metalness = loader.load("./textures/gold/metal.jpg");

            this.materials.crenel.map =loader.load("./textures/ice/ice.jpg");
            this.materials.crenel.normalMap =loader.load("./textures/ice/normal.jpg");
            this.materials.crenel.roughnessMap =loader.load("./textures/ice/rough.jpg");
            //this.materials.crenel.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.crenel.aoMap = null;
            //this.materials.crenel.metalness = loader.load("./textures/gold/metal.jpg");
        }

        else if (theme === "madmax") {


            this.materials.wall.map =loader.load("./textures/madmax/madmax.jpg");
            this.materials.wall.normalMap =loader.load("./textures/madmax/normal.jpg");
            this.materials.wall.roughnessMap =loader.load("./textures/madmax/rough.jpg");
            //this.materials.wall.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.wall.aoMap = loader.load("./textures/madmax/ao.jpg");
           // this.materials.wall.metalness = 0.8;

            this.materials.ramp.map =loader.load("./textures/madmax/madmax.jpg");
            this.materials.ramp.normalMap =loader.load("./textures/madmax/normal.jpg");
            this.materials.ramp.roughnessMap =loader.load("./textures/madmax/rough.jpg");
            //this.materials.ramp.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.ramp.aoMap = loader.load("./textures/madmax/ao.jpg");
            //this.materials.ramp.metalness = loader.load("./textures/gold/metal.jpg");

            this.materials.crenel.map =loader.load("./textures/madmax/madmax.jpg");
            this.materials.crenel.normalMap =loader.load("./textures/madmax/normal.jpg");
            this.materials.crenel.roughnessMap =loader.load("./textures/madmax/rough.jpg");
            //this.materials.crenel.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.crenel.aoMap = loader.load("./textures/madmax/ao.jpg");
            //this.materials.crenel.metalness = loader.load("./textures/gold/metal.jpg");
        }

        else if (theme === "cyber") {

            this.materials.wall.map =loader.load("./textures/cyber/cyber.jpg");
            this.materials.wall.normalMap =loader.load("./textures/cyber/normal.jpg");
            this.materials.wall.roughnessMap =loader.load("./textures/cyber/rough.jpg");
            //this.materials.wall.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.wall.aoMap = loader.load("./textures/cyber/ao.jpg");
           // this.materials.wall.metalness = 0.8;

            this.materials.ramp.map =loader.load("./textures/cyber/cyber.jpg");
            this.materials.ramp.normalMap =loader.load("./textures/cyber/normal.jpg");
            this.materials.ramp.roughnessMap =loader.load("./textures/cyber/rough.jpg");
            //this.materials.ramp.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.ramp.aoMap = loader.load("./textures/cyber/ao.jpg");
            //this.materials.ramp.emissiveMap = loader.load("./textures/cyber/emissive.jpg");
            //this.materials.ramp.metalness = loader.load("./textures/gold/metal.jpg");

            this.materials.crenel.map =loader.load("./textures/cyber/cyber.jpg");
            this.materials.crenel.normalMap =loader.load("./textures/cyber/normal.jpg");
            this.materials.crenel.roughnessMap =loader.load("./textures/cyber/rough.jpg");
            //this.materials.crenel.metalnessMap =loader.load("./textures/ice/metal.jpg");
            this.materials.crenel.aoMap = loader.load("./textures/cyber/ao.jpg");
            //this.materials.crenel.emissiveMap = loader.load("./textures/cyber/emissive.jpg");
            //this.materials.crenel.metalness = loader.load("./textures/gold/metal.jpg");
        }

        this.materials.wall.needsUpdate = true;
        this.materials.ramp.needsUpdate = true;
        this.materials.crenel.needsUpdate = true;
    }
}