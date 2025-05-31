import {CGFobject} from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */

export class MyUnitCube extends CGFobject{

    this
    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [
            -0.5,-0.5,-0.5,
            -0.5,-0.5,0.5,
            -0.5,0.5,-0.5,
            -0.5,0.5,0.5,
            0.5,-0.5,-0.5,
            0.5,-0.5,0.5,
             0.5,0.5,-0.5,
             0.5,0.5,0.5,
        ];

        //Counter-clockwise reference of vertices
        this.indices = [
            0,1,3, // normal to x
            3,1,0, // normal to x
            0, 2, 3, // normal to x
            3, 2, 0, // normal to x
            6, 7, 2, // upper triangule
            2, 7, 6, // upper triangule
            7,2,3, // upper triangule
            3,2,7, // upper triangule
            // face da direita
            0, 2, 6,
            6, 2, 0,
            6, 0, 4,
            4, 0, 6,
            // base
            0, 4, 1,
            1, 4, 0,
            1, 4, 5,
            5, 4, 1,

            5, 7, 6,
            6, 7, 5,
            6, 4, 5,
            5, 4, 6,

            5, 6, 3,
            3, 6, 5,
            3, 1, 5,
            5, 1, 3,
        ];

        //The defined indices (and corresponding vertices)
        //will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }

}