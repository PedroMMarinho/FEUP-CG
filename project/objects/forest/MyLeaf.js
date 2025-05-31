import { CGFappearance, CGFobject } from '../../../lib/CGF.js';
import { MyPyramid } from '../shape_utils/MyPyramid.js';

export class MyLeaf extends CGFobject {
  /**
   * Represents one layer of foliage (a scaled pyramid).
   * @param {CGFscene} scene
   * @param {number} radius - The desired base radius for this leaf layer.
   * @param {number} height - The desired height for this leaf layer.
   * @param {CGFtexture | null} texture - The texture to apply (takes precedence).
   * @param {number[] | null} colorRGB - Foliage color [r, g, b] (normalized 0-1), used if texture is null.
   * @param {number} [slices=4] 
   */
  constructor(scene, radius, height, texture, colorRGB, slices = 5) { 
    super(scene);

    this.radius = radius;
    this.height = height;
    this.slices = slices;

    this.pyramid = new MyPyramid(scene, this.slices, 1);

    this.leafAppearance = new CGFappearance(scene);
    this.leafAppearance.setShininess(10.0); 

    if (texture) {
      this.leafAppearance.setTexture(texture);
      this.leafAppearance.setTextureWrap('REPEAT', 'REPEAT');
      this.leafAppearance.setAmbient(1, 1, 1, 1);
      this.leafAppearance.setDiffuse(0.5, 0.5, 0.5, 1); 
      this.leafAppearance.setSpecular(0.3, 0.3, 0.3, 1); 

    } else if (colorRGB != null) {
      const r = Math.max(0, Math.min(1, colorRGB[0]));
      const g = Math.max(0, Math.min(1, colorRGB[1]));
      const b = Math.max(0, Math.min(1, colorRGB[2]));

      this.leafAppearance.setTexture(null); 
      this.leafAppearance.setAmbient(r * 0.6, g * 0.6, b * 0.6, 1.0); 
      this.leafAppearance.setDiffuse(r, g, b, 1.0);
      this.leafAppearance.setSpecular(0.1, 0.1, 0.1, 1.0); 

    } else {
      this.leafAppearance.setTexture(null);
      this.leafAppearance.setAmbient(0.1, 0.3, 0.1, 1.0);
      this.leafAppearance.setDiffuse(0.2, 0.6, 0.2, 1.0); 
      this.leafAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
    }
  }

  display() {
    this.leafAppearance.apply();

    this.scene.pushMatrix();
    const scaleX = this.radius;
    const scaleY = this.height;
    const scaleZ = this.radius;
    this.scene.scale(scaleX, scaleY, scaleZ);
    this.pyramid.display();
    this.scene.popMatrix();
  }

}