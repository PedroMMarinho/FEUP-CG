import { CGFappearance, CGFtexture } from "../../../lib/CGF.js";
import { MySphere } from "../shape_utils/MySphere.js";

export class MyPanorama {
  constructor(scene, texture) {
    this.scene = scene;
    this.texture = texture;

    
    this.sphere = new MySphere(scene, 64, 32, true); 

    this.material = new CGFappearance(scene);
    this.material.setEmission(1, 1, 1, 1);
    this.material.setAmbient(0, 0, 0, 1);
    this.material.setDiffuse(0, 0, 0, 1);
    this.material.setSpecular(0, 0, 0, 1);
    this.material.setTexture(texture);
  }

  display() {
    this.scene.pushMatrix();

    const camPos = this.scene.camera.position;
    this.scene.translate(camPos[0], camPos[1] - 50, camPos[2]);

    this.scene.scale(400, 400, 400);
    this.material.apply();
    this.sphere.display();

    this.scene.popMatrix();
  }
}
