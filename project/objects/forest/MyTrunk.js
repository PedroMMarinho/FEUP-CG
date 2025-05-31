import { CGFappearance, CGFobject } from '../../../lib/CGF.js';

/**
 * MyTrunk
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of subdivisions around the Y Axis
 * @param stacks - number of subdivisions along the Y Axis
 * @param bottomRadius - radius of the bottom base
 * @param topRadius - radius of the top base
 * @param height - height of the trunk
 * @param texture - texture to apply to the trunk
 */

export class MyTrunk extends CGFobject {
  constructor(scene, slices, stacks, bottomRadius, topRadius, height, texture) {
    super(scene);

    this.slices = slices;
    this.stacks = stacks;
    this.bottomRadius = bottomRadius;
    this.topRadius = topRadius;
    this.height = height;
    this.texture = texture;
    this.trunkAppearance = new CGFappearance(scene);

    if (this.texture) {
      this.trunkAppearance.setTexture(this.texture);
    } else {
      this.trunkAppearance.setAmbient(0.3, 0.15, 0.05, 1.0);
      this.trunkAppearance.setDiffuse(0.4, 0.2, 0.1, 1.0);
      this.trunkAppearance.setSpecular(0.1, 0.05, 0.02, 1.0);
    }

    this.initBuffers();
  }

  initBuffers() {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    const radiusDiff = this.bottomRadius - this.topRadius;
    const slopeAngle = Math.atan2(radiusDiff, this.height);

    this.vertices.push(0, 0, 0);
    this.normals.push(0, -1, 0);
    this.texCoords.push(0.5, 0.5);

    for (let i = 0; i < this.slices; i++) {
      const angle = (i * 2 * Math.PI) / this.slices;
      const x = Math.cos(angle) * this.bottomRadius;
      const z = Math.sin(angle) * this.bottomRadius;

      this.vertices.push(x, 0, z);
      this.normals.push(0, -1, 0);
      this.texCoords.push(0.5 + 0.5 * Math.cos(angle), 0.5 - 0.5 * Math.sin(angle));
    }

    for (let i = 0; i < this.slices; i++) {
      if (i < this.slices - 1) {
        this.indices.push(0, i + 1, i + 2); 
      } else {
        this.indices.push(0, i + 1, 1);   
      }
    }

    const bodyStart = this.vertices.length / 3;

    for (let stack = 0; stack <= this.stacks; stack++) {
      const stackHeight = (this.height * stack) / this.stacks;
      const stackRadius = this.bottomRadius - (radiusDiff * stack) / this.stacks;

      for (let i = 0; i < this.slices; i++) {
        const angle = (i * 2 * Math.PI) / this.slices;
        const x = Math.cos(angle) * stackRadius;
        const z = Math.sin(angle) * stackRadius;

        const nx = Math.cos(angle) * Math.cos(slopeAngle);
        const ny = Math.sin(slopeAngle);
        const nz = Math.sin(angle) * Math.cos(slopeAngle);

        this.vertices.push(x, stackHeight, z);
        this.normals.push(nx, ny, nz);

        this.texCoords.push(i / this.slices, stack / this.stacks);
      }
    }

    for (let stack = 0; stack < this.stacks; stack++) {
      for (let i = 0; i < this.slices; i++) {
        const current = bodyStart + stack * this.slices + i;
        const next = bodyStart + stack * this.slices + ((i + 1) % this.slices);
        const currentAbove = bodyStart + (stack + 1) * this.slices + i;
        const nextAbove = bodyStart + (stack + 1) * this.slices + ((i + 1) % this.slices);

        this.indices.push(current, nextAbove, next);
        this.indices.push(current, currentAbove, nextAbove);
      }
    }

    const topCenter = this.vertices.length / 3;
    this.vertices.push(0, this.height, 0);
    this.normals.push(0, 1, 0);
    this.texCoords.push(0.5, 0.5);

    const topCapStart = bodyStart + this.stacks * this.slices;

    for (let i = 0; i < this.slices; i++) {
      const current = topCapStart + i;
      const next = topCapStart + ((i + 1) % this.slices);

      this.indices.push(topCenter, next, current); 
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
  }

  display() {
    this.trunkAppearance.apply();
    super.display();
  }
}