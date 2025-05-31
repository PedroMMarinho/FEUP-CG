import {CGFobject} from '../../../lib/CGF.js';
/**
* MyPyramid
* @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of divisions around the Y axis
 * @param stacks - number of divisions along the Y axis
*/
export class MyPyramid extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2 * Math.PI / this.slices;

        // Generate side faces
        for (var i = 0; i < this.slices; i++) {
            var sa = Math.sin(ang);
            var saa = Math.sin(ang + alphaAng);
            var ca = Math.cos(ang);
            var caa = Math.cos(ang + alphaAng);

            // Vertices
            this.vertices.push(0, 1, 0); 
            this.vertices.push(ca, 0, -sa); 
            this.vertices.push(caa, 0, -saa);

            // Normals
            var normal = [
                saa - sa,
                ca * saa - sa * caa,
                caa - ca
            ];
            var nsize = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
            normal = normal.map(n => n / nsize);

            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);

            // Texture coordinates
            this.texCoords.push(0.5, 1); // Top vertex
            this.texCoords.push(0, 0);   // Bottom left
            this.texCoords.push(1, 0);   // Bottom right

            // Indices
            this.indices.push(3 * i, 3 * i + 1, 3 * i + 2);

            ang += alphaAng;
        }

        // Generate base
        const baseStartIndex = this.vertices.length / 3;
        for (let i = 0; i < this.slices; i++) {
            const angle = i * alphaAng;
            this.vertices.push(Math.cos(angle), 0, -Math.sin(angle));
            this.normals.push(0, -1, 0);
            this.texCoords.push(i / this.slices, 0);
        }

        // Indices for the base
        if (this.slices > 2) {
            for (let i = 1; i < this.slices - 1; i++) {
                this.indices.push(baseStartIndex, baseStartIndex + i + 1, baseStartIndex + i);
            }
            this.indices.push(baseStartIndex, baseStartIndex + 1, baseStartIndex + this.slices - 1);
        } else if (this.slices === 2) {
            this.indices.push(baseStartIndex, baseStartIndex + 1, baseStartIndex);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of slices
     */
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); 

        this.initBuffers();
        this.initNormalVizBuffers();
    }
}