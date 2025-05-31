import {CGFobject} from '../../../lib/CGF.js';
/**
* MyCircle
* @constructor
* @param scene - Reference to MyScene object
* @param slices - number of slices around the circle
* @param minS - minimum texture coordinate in S
* @param maxS - maximum texture coordinate in S
* @param minT - minimum texture coordinate in T
* @param maxT - maximum texture coordinate in T
*/
export class MyCircle extends CGFobject {
	constructor(scene, slices, minS, maxS, minT, maxT) {
		super(scene);
		slices = typeof slices !== 'undefined' ? slices : 20;
		this.slices = slices;
		this.minS = minS || 0;
		this.maxS = maxS || 1;
		this.minT = minT || 0;
		this.maxT = maxT || 1;
		this.initBuffers();
	}
	
	initBuffers() {
		// Generate vertices, normals, and texCoords
		this.vertices = [];
		this.normals = [];
		this.texCoords = [];
		this.indices = [];
		
		this.vertices.push(0, 0, 0);
		this.normals.push(0, 0, 1);  
		this.texCoords.push(0.5, 0.5); 
		
		const radius = 0.5; 
		const angleIncrement = (2 * Math.PI) / this.slices;
		
		for (let i = 0; i <= this.slices; i++) {
			const angle = i * angleIncrement;
			const x = radius * Math.cos(angle);
			const y = radius * Math.sin(angle);
			
			this.vertices.push(x, y, 0);
			
			this.normals.push(0, 0, 1);
			
			const s = 0.5 + 0.5 * Math.cos(angle);  
			const t = 0.5 + 0.5 * Math.sin(angle);  
			this.texCoords.push(
				this.minS + s * (this.maxS - this.minS),
				this.minT + t * (this.maxT - this.minT)
			);
		}
		
		for (let i = 1; i <= this.slices; i++) {
			this.indices.push(0);  
			this.indices.push(i);  
			this.indices.push(i + 1 <= this.slices ? i + 1 : 1);  
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
	
	setFillMode() { 
		this.primitiveType = this.scene.gl.TRIANGLES;
	}

	setLineMode() { 
		this.primitiveType = this.scene.gl.LINE_LOOP;
	}
}