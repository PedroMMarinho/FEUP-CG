import { CGFobject, CGFappearance } from '../../../lib/CGF.js';
import { MyTrunk } from './MyTrunk.js';
import { MyLeaf } from './MyLeaf.js'; // Use the updated MyLeaf

export class MyTree extends CGFobject {
    /**
     * Constructor for MyTree with variable appearance.
     * @param {CGFscene} scene - Reference to the scene object.
     * @param {number} treeTiltDegrees - Inclinação da árvore: Rotation angle in degrees (0 = vertical).
     * @param {string} treeTiltAxis - Inclinação da árvore: Axis of rotation ('X' or 'Z').
     * @param {number} trunkRadius - Raio da base do tronco.
     * @param {number} treeHeight - Altura total da árvore.
     * @param {number[]} foliageColorRGB - A cor da copa em RGB [r, g, b] (normalized 0-1), used if leafTexture is null.
     * @param {CGFtexture | null} trunkTexture - Texture for the trunk (takes precedence over default color).
     * @param {CGFtexture | null} leafTexture - Texture for the leaves (takes precedence over foliageColorRGB).
     */
    constructor(scene, treeTiltDegrees, treeTiltAxis, trunkRadius, treeHeight, foliageColorRGB, trunkTexture, leafTexture) {
        super(scene);

        this.treeTiltRadians = treeTiltDegrees * Math.PI / 180;
        this.treeTiltAxisVec = [0, 0, 1]; 

        if (treeTiltAxis.toLowerCase() === 'x') {
            this.treeTiltAxisVec = [1, 0, 0];
        }

        this.trunkRadius = trunkRadius;
        this.treeHeight = treeHeight;
        this.foliageColor = foliageColorRGB; 
        this.trunkTexture = trunkTexture;
        this.leafTexture = leafTexture; 

        // --- Derived Parameters ---
        this.trunkHeight = this.treeHeight * 0.2;
        this.foliageHeight = this.treeHeight * 0.8;

        if (this.trunkHeight <= 0 || this.foliageHeight <= 0) {
             console.error("MyTree: treeHeight must be positive.");
             this.trunkHeight = 1; this.foliageHeight = 4; this.treeHeight = 5;
        }

        const layerHeightDensityFactor = 3.0; 
        this.numLayers = Math.max(2, Math.round(this.foliageHeight / layerHeightDensityFactor));
        this.layerHeight = this.foliageHeight / this.numLayers;

        const maxFoliageRadiusFactor = 4.0; 
        const minFoliageRadiusFactor = 1.5; 
        const maxFoliageRadius = this.trunkRadius * maxFoliageRadiusFactor;
        const minFoliageRadius = this.trunkRadius * minFoliageRadiusFactor;

        // --- Create Components ---
        const topRadiusFactor = 0.7;

        this.trunk = new MyTrunk(
            scene,
            5, 
            1,
            this.trunkRadius,
            this.trunkRadius * topRadiusFactor,
            this.trunkHeight,
            this.trunkTexture
        );

        this.foliageLayers = [];
        for (let i = 0; i < this.numLayers; i++) {
            let t = this.numLayers === 1 ? 0 : i / (this.numLayers - 1);
            let currentRadius = maxFoliageRadius + (minFoliageRadius - maxFoliageRadius) * t;
             if (currentRadius < 0) currentRadius = 0;

            let yOffset = this.trunkHeight + i * this.layerHeight * 1.1; 

            let leafLayer = new MyLeaf(
                scene,
                currentRadius,
                this.layerHeight * 1.5, 
                this.leafTexture, 
                this.foliageColor 
            );

            this.foliageLayers.push({
                layer: leafLayer,
                yPos: yOffset
            });
        }


    }

    display() {

        this.scene.pushMatrix();

        this.scene.rotate(this.treeTiltRadians, ...this.treeTiltAxisVec);


        this.trunk.display();


        for (const foliage of this.foliageLayers) {
            this.scene.pushMatrix();
            this.scene.translate(0, foliage.yPos, 0);
            foliage.layer.display(); 
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
        this.scene.setDefaultAppearance(); 
    }

}