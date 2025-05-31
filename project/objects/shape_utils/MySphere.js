import { CGFobject } from '../../../lib/CGF.js';

export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, invert = false) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.invert = invert;
        this.initBuffers();
    }

    initBuffers() {
        const vertices = [];
        const indices = [];
        const normals = [];
        const texCoords = [];

        const deltaAlpha = Math.PI / (2 * this.stacks);
        const deltaTheta = 2 * Math.PI / this.slices;

        for (let stack = 0; stack <= 2 * this.stacks; ++stack) {
            const alpha = stack * deltaAlpha;
            const y = Math.cos(alpha);
            const r = Math.sin(alpha);

            for (let slice = 0; slice <= this.slices; ++slice) {
                const theta = slice * deltaTheta;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                vertices.push(x, y, z);

                if (this.invert) {
                    normals.push(-x, -y, -z);
                } else {
                    normals.push(x, y, z);
                }

                texCoords.push(slice / this.slices, stack / (2 * this.stacks));
            }
        }

        for (let stack = 0; stack < 2 * this.stacks; ++stack) {
            for (let slice = 0; slice < this.slices; ++slice) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;

                if (this.invert) {
                    indices.push(first, second + 1, first + 1);
                    indices.push(first, second, second + 1);
                } else {
                    indices.push(first, first + 1, second + 1);
                    indices.push(first, second + 1, second);
                }
            }
        }

        this.vertices = vertices;
        this.indices = indices;
        this.normals = normals;
        this.texCoords = texCoords;

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
