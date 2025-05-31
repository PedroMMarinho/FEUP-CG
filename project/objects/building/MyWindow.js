import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyPlane } from '../shape_utils/MyPlane.js';

export class MyWindow extends CGFobject {
    
    constructor(scene, texture) {
        super(scene);
        this.plane = new MyPlane(scene, 1);
        this.windowAppearance = new CGFappearance(scene);
        this.windowAppearance.setTexture(texture);
        this.windowAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        this.windowAppearance.apply();
        this.plane.display();
    }
}
