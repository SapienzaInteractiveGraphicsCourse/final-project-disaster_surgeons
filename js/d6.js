import * as THREE from "three";
import * as CANNON from "cannon-es";

export class D6 {

    constructor(scene, world) {


        this.body = new CANNON.Body({
            mass: 0.1,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
        });

        this.body.position.set(0, 10, 0);
        world.addBody(this.body);


        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const materials = [
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(2) }),
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(5) }),
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(1) }),
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(6) }),
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(3) }),
            new THREE.MeshStandardMaterial({ map: this.createFaceTexture(4) }),
        ];

        this.visual = new THREE.Mesh(geometry, materials);
        this.visual.castShadow = true;
        this.visual.receiveShadow = true;

        scene.add(this.visual);

        this.faceValues = [1, 6, 2, 5, 3, 4];

        this.faceNormals = [
            new CANNON.Vec3(0, 1, 0),
            new CANNON.Vec3(0, -1, 0),
            new CANNON.Vec3(1, 0, 0),
            new CANNON.Vec3(-1, 0, 0),
            new CANNON.Vec3(0, 0, 1),
            new CANNON.Vec3(0, 0, -1)
        ];
    }


    createFaceTexture(number) {

        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext("2d");

        // sfondo
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 256, 256);

        // bordo
        ctx.strokeStyle = "black";
        ctx.lineWidth = 16;
        ctx.strokeRect(0, 0, 256, 256);

        const center = 128;
        const offset = 70;

        const drawPip = (x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            ctx.fill();
        };

        ctx.fillStyle = "black";

        if (number === 1) {
            drawPip(center, center);
        }

        if (number === 2) {
            drawPip(center - offset, center - offset);
            drawPip(center + offset, center + offset);
        }

        if (number === 3) {
            drawPip(center - offset, center - offset);
            drawPip(center, center);
            drawPip(center + offset, center + offset);
        }

        if (number === 4) {
            drawPip(center - offset, center - offset);
            drawPip(center + offset, center - offset);
            drawPip(center - offset, center + offset);
            drawPip(center + offset, center + offset);
        }

        if (number === 5) {
            drawPip(center - offset, center - offset);
            drawPip(center + offset, center - offset);
            drawPip(center, center);
            drawPip(center - offset, center + offset);
            drawPip(center + offset, center + offset);
        }

        if (number === 6) {
            drawPip(center - offset, center - offset);
            drawPip(center + offset, center - offset);
            drawPip(center - offset, center);
            drawPip(center + offset, center);
            drawPip(center - offset, center + offset);
            drawPip(center + offset, center + offset);
        }

        return new THREE.CanvasTexture(canvas);
    }

    getTopFace() {

        const upWorld = new CANNON.Vec3(0, 1, 0);

        let maxDot = -Infinity;
        let faceIndex = -1;

        for (let i = 0; i < this.faceNormals.length; i++) {

            const worldNormal = this.body.quaternion.vmult(this.faceNormals[i]);
            const dot = worldNormal.dot(upWorld);

            if (dot > maxDot) {
                maxDot = dot;
                faceIndex = i;
            }
        }

        return faceIndex;
    }

    getValue() {
        return this.faceValues[this.getTopFace()];
    }
}