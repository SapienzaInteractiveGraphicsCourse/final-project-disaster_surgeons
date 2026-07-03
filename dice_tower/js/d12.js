import * as THREE from "three";
import * as CANNON from "cannon-es";

export class D12 {

    constructor(scene, world) {

      
        const geometry = new THREE.DodecahedronGeometry(1);

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });

        this.visual = new THREE.Mesh(geometry, material);
        this.visual.castShadow = true;
        this.visual.receiveShadow = true;

        scene.add(this.visual);

       
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);

        this.visual.add(wireframe);

        // cannon
        const verts = geometry.attributes.position.array;
        const unique = [];

        for (let i = 0; i < verts.length; i += 3) {

            const x = verts[i];
            const y = verts[i + 1];
            const z = verts[i + 2];

            const exists = unique.some(v =>
                Math.abs(v.x - x) < 0.0001 &&
                Math.abs(v.y - y) < 0.0001 &&
                Math.abs(v.z - z) < 0.0001
            );

            if (!exists) {
                unique.push({ x, y, z });
            }
        }

        const faces = [];

        for (let i = 0; i < verts.length; i += 9) {

            const face = [];

            for (let j = 0; j < 3; j++) {

                const x = verts[i + j * 3];
                const y = verts[i + j * 3 + 1];
                const z = verts[i + j * 3 + 2];

                const index = unique.findIndex(v =>
                    Math.abs(v.x - x) < 0.0001 &&
                    Math.abs(v.y - y) < 0.0001 &&
                    Math.abs(v.z - z) < 0.0001
                );

                face.push(index);
            }

            faces.push(face);
        }

        const cannonVertices = unique.map(
            v => new CANNON.Vec3(v.x, v.y, v.z)
        );

        const shape = new CANNON.ConvexPolyhedron({
            vertices: cannonVertices,
            faces: faces
        });

        this.body = new CANNON.Body({
            mass: 0.1,
            shape: shape
        });

        this.body.position.set(0, 10, 0);
        this.body.wakeUp();

        world.addBody(this.body);

        this.computeFaceNormals();

        this.faceValues = [1,2,3,4,5,6,7,8,9,10,11,12];

        this.faceSprites = [];

        for (let i = 1; i <= 12; i++) {
            const sprite = this.createFace(i);

            this.visual.add(sprite);
            this.faceSprites.push(sprite);
        }
    }

//mettere i numeri sulle facce
    createFace(number) {

        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext("2d");

        // sfondo bianco
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 256, 256);

        // bordo nero
        ctx.strokeStyle = "black";
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 256, 256);

        // numero
        ctx.fillStyle = "black";
        ctx.font = "bold 110px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(number.toString(), 128, 128);


        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

        const sprite = new THREE.Sprite(material);

        sprite.scale.set(0.4, 0.4, 0.4);

        return sprite;
    }



    computeFaceNormals() {

    const shape = this.body.shapes[0];

    this.faceNormals = [];

    const faceMap = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 5],
        [0, 5, 1],
        [1, 6, 2],
        [2, 6, 3],
        [3, 6, 4],
        [4, 6, 5],
        [5, 6, 1],
        [1, 2, 3],
        [3, 4, 5]
    ];

    for (let f of faceMap) {

        const a = shape.vertices[f[0]];
        const b = shape.vertices[f[1]];
        const c = shape.vertices[f[2]];

        const ab = new CANNON.Vec3();
        const ac = new CANNON.Vec3();

        b.vsub(a, ab);
        c.vsub(a, ac);

        const normal = new CANNON.Vec3();
        ab.cross(ac, normal);
        normal.normalize();

        this.faceNormals.push(normal);
    }
    this.faceCount = 12;
}
    getTopFace() {

        const upWorld = new CANNON.Vec3(0, 1, 0);

        let maxDot = -Infinity;
        let faceIndex = 0;

        const count = Math.min(this.faceNormals.length, this.faceCount);

        for (let i = 0; i < count; i++) {

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