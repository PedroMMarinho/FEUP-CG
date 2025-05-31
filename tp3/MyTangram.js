import { CGFappearance, CGFobject } from "../lib/CGF.js";
import { MyDiamond} from "./MyDiamond.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyParallelogram } from "./MyParallelogram.js";
import { MyTriangleSmall } from "./MyTriangleSmall.js";
/**
 * MyTangram
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyTangram extends CGFobject {
  constructor(scene) {
    super(scene);
    this.scene.diamond = new MyDiamond(scene);
    this.scene.triangle = new MyTriangle(scene);
    this.scene.parallelogram = new MyParallelogram(scene);
    this.scene.triangleSmall = new MyTriangleSmall(scene);   
    this.initMaterials();
}

  enableNormalViz(){  
    this.scene.diamond.enableNormalViz();
    this.scene.triangle.enableNormalViz();
    this.scene.parallelogram.enableNormalViz();
    this.scene.triangleSmall.enableNormalViz();
  }
  disableNormalViz(){
    this.scene.diamond.disableNormalViz();
    this.scene.triangle.disableNormalViz();
    this.scene.parallelogram.disableNormalViz();
    this.scene.triangleSmall.disableNormalViz();
  }
  initMaterials() {

    // Blue triangule
    this.material5 = new CGFappearance(this.scene);
    this.material5.setAmbient(0, 0, 1, 1.0);
    this.material5.setDiffuse(0, 0, 1, 1.0);
    this.material5.setSpecular(1, 1, 1, 1.0);
    this.material5.setShininess(50.0);
    // Orange triangle 
    
    this.material6 = new CGFappearance(this.scene);
    this.material6.setAmbient(1, 0.5, 0, 1.0);
    this.material6.setDiffuse(1, 0.5, 0, 1.0);
    this.material6.setSpecular(1, 1, 1, 1.0);
    this.material6.setShininess(50.0);

    // Parallelogram yellow
    this.material7 = new CGFappearance(this.scene);
    this.material7.setAmbient(1, 1, 0, 1.0);
    this.material7.setDiffuse(1, 1, 0, 1.0);
    this.material7.setSpecular(1, 1, 1, 1.0);
    this.material7.setShininess(50.0);

    // Red triangle
    this.material8 = new CGFappearance(this.scene);
    this.material8.setAmbient(1, 0, 0, 1.0);
    this.material8.setDiffuse(1, 0, 0, 1.0);
    this.material8.setSpecular(1, 1, 1, 1.0);
    this.material8.setShininess(50.0);

    // Pink triangle
    this.material9 = new CGFappearance(this.scene);
    this.material9.setAmbient(1, 0.75, 0.8, 1.0);
    this.material9.setDiffuse(1, 0.75, 0.8, 1.0);
    this.material9.setSpecular(1, 1, 1, 1.0);
    this.material9.setShininess(50.0);

    // Green diamond
    this.material10 = new CGFappearance(this.scene);
    this.material10.setAmbient(0, 1, 0, 1.0);
    this.material10.setDiffuse(0, 1, 0, 1.0);
    this.material10.setSpecular(1, 1, 1, 1.0);
    this.material10.setShininess(50.0);

    // Purple triangle
    this.material11 = new CGFappearance(this.scene);
    this.material11.setAmbient(0.5, 0, 0.5, 1.0);
    this.material11.setDiffuse(0.5, 0, 0.5, 1.0);
    this.material11.setSpecular(1, 1, 1, 1.0);
    this.material11.setShininess(50.0);
    
  }


  display() {
    // Blue triangule
    this.scene.pushMatrix();
    this.scene.translate(-1, -1, 0);
    this.scene.rotate(Math.PI / 2, 0, 0, 1);
    this.material5.apply();

    this.scene.triangle.display();
    this.scene.pushMatrix();
    this.scene.translate(0, -2, 0);
    this.scene.rotate(Math.PI, 0, 0, 1);
    // Orange triangul6
    this.material6.apply();
    this.scene.triangle.display();

    
    this.scene.popMatrix();
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(1, -3 / 2, 0);
    this.scene.scale(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.scene.rotate((7 * Math.PI) / 4, 0, 0, 1);
    this.scene.translate(-3 / 2, -1 / 2, 0);

    // parallelogram yellow
    this.material7.apply();
    this.scene.parallelogram.display();

    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(3 / 2, -1 / 2, 0);
    this.scene.rotate((-3 * Math.PI) / 4, 0, 0, 1);
    this.scene.scale(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
    // red triangule
    this.material8.apply();
    this.scene.triangleSmall.display();
    
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(1, 0, 0);
    this.scene.scale(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
    this.scene.rotate((-3 * Math.PI) / 4, 0, 0, 1);
    // Pink triangule
    this.material9.apply();
    this.scene.triangle.display();
    this.scene.popMatrix();

    var matrixTranslate = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 0, 1];
   var matrixScale = [
      Math.sqrt(2) / 2,
      0,
      0,
      0,
      0,
      Math.sqrt(2) / 2,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];

    this.scene.pushMatrix();
    this.scene.multMatrix(matrixScale);
    this.scene.multMatrix(matrixTranslate);
    // green diamond
    this.scene.customMaterial.apply();
    this.scene.diamond.display();

    this.scene.pushMatrix();

    this.scene.popMatrix();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.2, -0.2, 0);
    this.scene.scale(0.6, 0.6, 1);
    this.scene.rotate(Math.PI / 4, 0, 0, 1);
    // Purple triangule
    this.material11.apply();
    this.scene.triangleSmall.display();
    this.scene.popMatrix();
  }
}
