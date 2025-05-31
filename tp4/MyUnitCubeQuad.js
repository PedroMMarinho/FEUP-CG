import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';
/**
 * MyUnitQuadCube
 * @constructor
 * @param scene - Reference to MyScene object
 */
export class MyUnitCubeQuad extends CGFobject {
    constructor(scene,topTexture,bottomTexture,sideTexture1, sideTexture2, sideTexture3, sideTexture4) {
        super(scene);
        this.quad = new MyQuad(scene);
        this.topTexture = topTexture;
        this.sideTexture1 = sideTexture1;
        this.sideTexture2 = sideTexture2;
        this.sideTexture3 = sideTexture3;
        this.sideTexture4 = sideTexture4;
        this.bottomTexture = bottomTexture;
    }
    
    display(){

        this.sideTexture1.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        // side 1
        this.scene.pushMatrix();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.scene.translate(0.5, 0.5, 0);
        this.scene.rotate(Math.PI, 0, 1 , 0);
        this.quad.display();
        this.scene.popMatrix();
        
        // side 2
        this.sideTexture2.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        this.scene.pushMatrix();
        this.scene.translate(0.5, 0.5, 1);
        this.quad.display();
        this.scene.popMatrix();
        

        // side 3
        this.sideTexture3.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.scene.translate(0.5, 0.5, 0);
        this.quad.display();
        this.scene.popMatrix();

        // side 4
        this.sideTexture4.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.scene.translate(-0.5, 0.5, 1);
        this.quad.display();
        this.scene.popMatrix();

        // top
        this.topTexture.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        this.scene.pushMatrix();
        this.scene.translate(0.5, 1, 0.5);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
        
        // bottom
        this.bottomTexture.bind(0);
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);

        this.scene.pushMatrix();
        this.scene.translate(0.5, 0, 0.5);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.quad.display();
        this.scene.popMatrix();
    }
}

