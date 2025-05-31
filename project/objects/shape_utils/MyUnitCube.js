import { CGFobject } from '../../../lib/CGF.js';
import { MyPlane } from './MyPlane.js';

export class MyUnitCube extends CGFobject {
    constructor(scene) {
        super(scene);
        this.face = new MyPlane(scene, 1); 
    }

    display() {
        const s = this.scene;

        // Front face
        s.pushMatrix();
        s.translate(0, 0, 0.5);
        this.face.display();
        s.popMatrix();

        // Back face
        s.pushMatrix();
        s.translate(0, 0, -0.5);
        s.rotate(Math.PI, 0, 1, 0);
        this.face.display();
        s.popMatrix();

        // Top face
        s.pushMatrix();
        s.translate(0, 0.5, 0);
        s.rotate(-Math.PI / 2, 1, 0, 0);
        this.face.display();
        s.popMatrix();

        // Bottom face
        s.pushMatrix();
        s.translate(0, -0.5, 0);
        s.rotate(Math.PI / 2, 1, 0, 0);
        this.face.display();
        s.popMatrix();

        // Right face
        s.pushMatrix();
        s.translate(0.5, 0, 0);
        s.rotate(Math.PI / 2, 0, 1, 0);
        this.face.display();
        s.popMatrix();

        // Left face
        s.pushMatrix();
        s.translate(-0.5, 0, 0);
        s.rotate(-Math.PI / 2, 0, 1, 0);
        this.face.display();
        s.popMatrix();
    }
}
