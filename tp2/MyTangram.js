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
}


  display() {
    // Blue triangule
    this.scene.setDiffuse(0,0.61,1.0,1.0);

    this.scene.pushMatrix();
    this.scene.translate(-1, -1, 0);
    this.scene.rotate(Math.PI / 2, 0, 0, 1);
    
    this.scene.triangle.display();
    this.scene.pushMatrix();
    this.scene.translate(0, -2, 0);
    this.scene.rotate(Math.PI, 0, 0, 1);
    // Orange triangule
    this.scene.setDiffuse(1.0,0.61,0,1.0);
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
    this.scene.setDiffuse(1.0,1.0,0,1.0);
    
    this.scene.parallelogram.display();

    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(3 / 2, -1 / 2, 0);
    this.scene.rotate((-3 * Math.PI) / 4, 0, 0, 1);
    this.scene.scale(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
    // red triangule
    this.scene.setDiffuse(1.0,0,0,1.0);
    this.scene.triangleSmall.display();
    
    this.scene.popMatrix();
    this.scene.pushMatrix();
    this.scene.translate(1, 0, 0);
    this.scene.scale(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1);
    this.scene.rotate((-3 * Math.PI) / 4, 0, 0, 1);
    // Pink triangule
    this.scene.setDiffuse(1.0,0.61,0.82,1.0);
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
    this.scene.setDiffuse(0,1.0,0,1.0);
    this.scene.diamond.display();

    this.scene.pushMatrix();

    this.scene.popMatrix();
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(-0.2, -0.2, 0);
    this.scene.scale(0.6, 0.6, 1);
    this.scene.rotate(Math.PI / 4, 0, 0, 1);
    // Purple triangule
    this.scene.setDiffuse(0.67,0.31,0.76,1.0);
    this.scene.triangleSmall.display();
    this.scene.popMatrix();
  }
}
