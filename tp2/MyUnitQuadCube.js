import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';
/**
 * MyUnitQuadCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitQuadCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.scene.quad = new MyQuad(scene);
    }
    
    display(){
        // base
        this.scene.quad.display();

        // sides
        
        // side 1
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0.5);
        this.scene.rotate(Math.PI, 0, 1, 1);

        this.scene.quad.display();
        this.scene.popMatrix();
        
        // side 2
        this.scene.pushMatrix();
        this.scene.translate(0.5,0.5,0);
        this.scene.rotate(Math.PI, 1, 1, 0);

        this.scene.quad.display();
        this.scene.popMatrix();


        // side 3
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0.5,0);
        this.scene.rotate(Math.PI, 1, 1, 0);

        this.scene.quad.display();
        this.scene.popMatrix();

        // side 4
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,-0.5);
        this.scene.rotate(Math.PI, 0, 1, 1);

        this.scene.quad.display();
        this.scene.popMatrix();

        //top
        this.scene.pushMatrix();
        this.scene.translate(0,1,0);

        this.scene.quad.display();

    }
}

