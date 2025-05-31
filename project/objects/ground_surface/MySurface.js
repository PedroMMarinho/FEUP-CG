import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../../../lib/CGF.js';
import { MyPlane } from '../shape_utils/MyPlane.js';

export class MySurface extends CGFobject {
  constructor(scene, grassTexture, heightMap, vertexShader, fragmentShader) {
    super(scene);
    this.plane = new MyPlane(scene, 200);
    this.grassTexture = new CGFtexture(scene, grassTexture);
    this.heightMap = new CGFtexture(scene, heightMap);
    
    this.grassAppearance = new CGFappearance(scene);
    this.grassAppearance.setTextureWrap('REPEAT', 'REPEAT');
    this.grassAppearance.setTexture(this.grassTexture);
    this.grassAppearance.setAmbient(1.0, 1.0, 1.0, 1.0);
    this.grassAppearance.setDiffuse(0.0, 0.0, 0.0, 1.0);
    this.grassAppearance.setSpecular(0.0, 0.0, 0.0, 1.0);

    this.grassAppearance.setShininess(10.0);
    
    this.shader = new CGFshader(scene.gl, vertexShader, fragmentShader);
    this.shader.setUniformsValues({
      uSampler: 0,
      uSampler2: 1,
      uHeightScale: 10,
      uAmbient: [0.3, 0.3, 0.3, 1.0],   
      uDiffuse: [0.6, 0.6, 0.6, 1.0],   
      uSpecular: [0.0, 0.0, 0.0, 1.0], 
      uShininess: 5.0,                
      uLightPosition: [200.0, 200.0, 200.0],
      uLightColor: [1.0, 1.0, 1.0, 1.0],
    });
    
  }

  display() {
    const previousShader = this.scene.activeShader;
    this.grassAppearance.apply();
    this.scene.setActiveShader(this.shader);

    this.shader.setUniformsValues({
      uUseHeightMap: true,
    });
    this.heightMap.bind(1);  
    this.grassTexture.bind(0);
    this.scene.pushMatrix();
    this.scene.scale(600, 1, 600);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.plane.display();
    this.scene.popMatrix();

    this.shader.setUniformsValues({
      uUseHeightMap: false,
    });
    

  const positions = [
    [600, 0, 0],    // Right
    [-600, 0, 0],   // Left
    [0, 0, 600],    // Back
    [0, 0, -600],    // Front
    [600, 0, -600], // Right-Back
    [-600, 0, -600],// Left-Back
    [600, 0, 600],  // Right-Front
    [-600, 0, 600]  // Left-Front

  ];

  for (let pos of positions) {
    this.scene.pushMatrix();
    this.scene.translate(pos[0], pos[1], pos[2]);
    this.scene.scale(600, 1, 600);
    this.scene.rotate(-Math.PI / 2, 1, 0, 0);
    this.plane.display();
    this.scene.popMatrix();
  }

  this.scene.setActiveShader(previousShader);

  }
}