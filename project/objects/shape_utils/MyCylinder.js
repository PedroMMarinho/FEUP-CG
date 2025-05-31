import { CGFobject } from '../../../lib/CGF.js';
/**
 * MyQuad
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyCylinder extends CGFobject {
  constructor(scene, slices, stacks) {
    super(scene);

    this.slices = slices;

    this.stacks = stacks;

    this.initBuffers();
  }

  initBuffers() {
    // Initialize center vertice on origin
    this.vertices = [0,0,0];
    this.indices = [];
    this.normals = [0,0,-1];

    for( let i = 0; i < this.slices; i++){
      let angle = (i * 2 * Math.PI) / this.slices;

      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.vertices.push(x,y,0);
      this.indices.push(i+1,0, (i+1) % this.slices + 1);
      this.normals.push(0,0,-1);
    }
    let base = this.vertices.length / 3;
    // Vertices + normals 
    for( let stack = 0; stack <= this.stacks; stack++){
      for (let i = 0; i < this.slices; i++) {
        let angle = (i * 2 * Math.PI) / this.slices;

        let x = Math.cos(angle);
        let y = Math.sin(angle);
        this.vertices.push(x, y, stack / this.stacks);
        this.normals.push(x,y,0)


      }
    }

    // Triangles 
    for( let stack = 0; stack < this.stacks; stack++ ){
      for( let i = 0; i < this.slices ; i++){
        let currBase = stack*this.slices;
        let nextStackBase = (stack+1)*this.slices ;
        this.indices.push((currBase + i) + base , (currBase + ( i + 1 ) % this.slices) +  base, (nextStackBase + i) +  base);
        this.indices.push((currBase + ( i + 1 ) % this.slices) +  base, (nextStackBase + ( i + 1 ) % this.slices)  +  base, ((nextStackBase + i)) + base);


      }
    }
    let front = this.vertices.length / 3 ;
    this.vertices.push(0,0,1);
    this.normals.push(0,0,1);
    for( let i = 0; i < this.slices; i++){
      let angle = (i * 2 * Math.PI) / this.slices;

      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.vertices.push(x,y,1);
      this.indices.push( front,front + i + 1,  front + (i+1) % this.slices +1 );
      this.normals.push(0,0,1);
    }

    

    
    
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.initGLBuffers();
  }

  updateBuffers(complexity){
    this.slices = 3 + Math.round(9 * complexity); 
    this.initBuffers();
    this.initNormalVizBuffers();
  }
}
